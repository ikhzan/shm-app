import os
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SensorReading
import datetime
from .serializers import *
from dotenv import load_dotenv
from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
import requests
import json
from django.db.models import Q

load_dotenv()

@api_view(['POST'])
def create_reading(request):
    reading = SensorReading(**request.data)
    reading.save()
    return Response({'status': 'saved'})

@api_view(['POST'])
def insert_sensor_data(request):
    sensor_id = request.data.get('sensor_id')
    data = request.data.get('data')
    timestamp = request.data.get('timestamp', datetime.datetime.utcnow())

    if not sensor_id or not data:
        return Response({'error': 'sensor_id and data are required'}, status=400)

    SensorReading(
        sensor_id=sensor_id,
        data={'values': data},
        timestamp=timestamp
    ).save()

    return Response({'status': '✅ Data inserted successfully'})

@api_view(['GET'])
def view_all_sensor_data(request):
    readings = SensorReading.objects.order_by('-id')[:10]
    serializer = SensorReadingSerializer(readings, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def start_mqtt_now(request):
    try:
        from sensors.broker.mqtt_client import start_mqtt_in_thread
        start_mqtt_in_thread()
        return Response({'status': '✅ MQTT client started'})
    except Exception as e:
        return Response({'error': f'❌ Failed to start MQTT: {e}'}, status=500)


def home_page(request):
    return render(request, 'home.html')


# CRUD FOR LoraGateway
# Create
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_gateway(request):
    serializer = LoraGatewaySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Read
@api_view(['GET'])
def all_gateway(request):
    enddevices = LoraGateway.objects.all()
    serializer = LoraGatewaySerializer(enddevices,many=True)
    return Response(serializer.data)

# Update
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_gateway(request):
    pk = request.query_params.get('id')
    if not pk:
        return Response({'error': 'Missing id parameter'}, status=400)
    try:
        enddevice = LoraGateway.objects.get(pk=pk)
    except LoraGateway.DoesNotExist:
        return Response({'error': 'Vehicle not found'}, status=404)

    serializer = LoraGatewaySerializer(enddevice, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# Delete
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_gateway(request):
    pk = request.query_params.get('id')
    if not pk:
        return Response({'error': 'Missing id parameter'}, status=400)
    try:
        enddevice = LoraGateway.objects.get(pk=pk)
    except LoraGateway.DoesNotExist:
        return Response({'error': 'Vehicle not found'}, status=404)

    enddevice.delete()
    return Response({'message': 'Vehicle deleted successfully'}, status=204)

# CRUD FOR VEHICLE
# Create
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_vehicle(request):
    try:
        end_devices_raw = request.data.get('end_devices', '[]')
        end_devices_data = json.loads(end_devices_raw)
    except json.JSONDecodeError:
        return Response({'end_devices': 'Invalid format'}, status=400)

    # Build clean initial data for serializer
    initial_data = {
        'name': request.data.get('name'),
        'image_path': request.FILES.get('image_path'),
        'end_devices': end_devices_data
    }

    serializer = VehicleRelatedSerializer(data=initial_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    print("Serializer errors:", serializer.errors)
    return Response(serializer.errors, status=400)


# Read
@api_view(['GET'])
def all_vehicle(request):
    vehicles = Vehicle.objects.prefetch_related('end_devices').all()

    unlinked_sensors = EndDevice.objects.filter(vehicle__isnull=True)

    vehicle_data = VehicleSerializer(vehicles, many=True).data
    unlinked_sensor_data = EndDeviceSerializer(unlinked_sensors, many=True).data

    return Response({
        "vehicles": vehicle_data,
        "unlinked_sensors": unlinked_sensor_data
    })

@api_view(['GET'])
def vehicle_detail(request):
    vehicle_id = request.query_params.get('id')
    if not vehicle_id:
        return Response({"error": "Missing vehicle ID in query parameters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        vehicle_data = Vehicle.objects.filter(id=vehicle_id)
        serializer = VehicleSerializer(vehicle_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as ex:
        print(f"Error fetching sensor data: {ex}")
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def linked_sensor_device(request):
    vehicles = Vehicle.objects.filter(end_devices__isnull=False).distinct().prefetch_related('end_devices')

    serializer = VehicleSerializer(vehicles, many=True)
    return Response({"vehicles": serializer.data})

# Update
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_vehicle(request):
    pk = request.query_params.get('id')
    if not pk:
        return Response({'error': 'Missing id parameter'}, status=400)
    try:
        enddevice = Vehicle.objects.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({'error': 'Vehicle not found'}, status=404)

    serializer = VehicleSerializer(enddevice, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# Delete
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_vehicle(request):
    pk = request.query_params.get('id')
    if not pk:
        return Response({'error': 'Missing id parameter'}, status=400)
    try:
        enddevice = Vehicle.objects.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({'error': 'Vehicle not found'}, status=404)

    enddevice.delete()
    return Response({'message': 'Vehicle deleted successfully'}, status=204)

# CRUD FOR END-DEVICE
# Create
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_enddevice(request):
    print(f"create_enddevice {request.data}")
    serializer = EndDevicePostSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Read
@api_view(['GET'])
def all_enddevice(request):
    # Get all end devices
    enddevices = EndDevice.objects.all()
    enddevice_serializer = EndDeviceGetSerializer(enddevices, many=True)

    # Get brokers not attached to any end device
    unattached_brokers = BrokerConnection.objects.filter(end_device__isnull=True)
    broker_serializer = BrokerConnectionSerializer(unattached_brokers, many=True)

    return Response({
        'end_devices': enddevice_serializer.data,
        'unattached_brokers': broker_serializer.data
    })

@api_view(['GET'])
def sensor_detail(request):
    device_id = request.query_params.get('sensor_id')
    if not device_id:
        return Response({"error": "Missing sensor_id in query parameters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        end_device = EndDevice.objects.filter(device_id=device_id)
        enddevice_serializer = EndDeviceGetSerializer(end_device,many=True)
        sensor_data = SensorReading.objects.filter(device_id=device_id)
        serializer = SensorReadingSerializer(sensor_data, many=True)
        return Response({
            'end_devices': enddevice_serializer.data,
            'sensor_data': serializer.data
        })
        # return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as ex:
        print(f"Error fetching sensor data: {ex}")
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.db.models import Q

@api_view(['GET'])
def device_edit_form(request):
    device_id = request.query_params.get('sensor_id')

    try:
        end_device = EndDevice.objects.filter(device_id=device_id).first()
        attached_broker_ids = EndDevice.objects.exclude(broker=None).values_list('broker__pk', flat=True)
        free_brokers = BrokerConnection.objects.exclude(pk__in=attached_broker_ids)

        # If editing and the device has a broker, include it back in the list
        if end_device and end_device.broker:
            free_brokers = BrokerConnection.objects.filter(
                Q(pk__in=free_brokers.values_list('pk', flat=True)) | Q(pk=end_device.broker.pk)
            )

        broker_serializer = BrokerConnectionSerializer(free_brokers, many=True)

        if end_device:
            device_serializer = EndDeviceGetSerializer(end_device)
            return Response({
                "device": device_serializer.data,
                "brokers": broker_serializer.data
            })

        return Response({
            "device": None,
            "brokers": broker_serializer.data
        })

    except Exception as ex:
        print(f"Error in edit form endpoint: {ex}")
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Update
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_enddevice(request,device_id):
    print(f"update_device {request.data}")

    try:
        enddevice = EndDevice.objects.get(device_id=device_id)
    except EndDevice.DoesNotExist:
        return Response({'error': 'EndDevice not found'}, status=404)

    serializer = EndDevicePostSerializer(enddevice, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# Delete
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_enddevice(request):
    pk = request.query_params.get('id')
    if not pk:
        return Response({'error': 'Missing id parameter'}, status=400)
    try:
        enddevice = EndDevice.objects.get(pk=pk)
    except EndDevice.DoesNotExist:
        return Response({'error': 'EndDevice not found'}, status=404)

    enddevice.delete()
    return Response({'message': 'EndDevice deleted successfully'}, status=204)

# CRUD FOR BROKER-CONNECTION
# Create
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_brokerconnection(request):
    serializer = BrokerConnectionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


# Read
@api_view(['GET'])
def read_brokerconnection(request):
    brokerconnections = BrokerConnection.objects.all()
    serializer = BrokerConnectionSerializer(brokerconnections,many=True)
    return Response(serializer.data)

# Update
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_brokerconnection(request, pk):
    try:
        brokerconnections = BrokerConnection.objects.get(pk=pk)
    except BrokerConnection.DoesNotExist:
        return Response({'error': 'brokerconnections not found'}, status=404)

    serializer = BrokerConnectionSerializer(brokerconnections, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# Delete
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_brokerconnection(request):
    pk = request.query_params.get('id')
    if not pk:
        return Response({'error': 'Missing id parameter'}, status=400)
    try:
        brokerconnection = BrokerConnection.objects.get(pk=pk)
    except BrokerConnection.DoesNotExist:
        return Response({'error': 'BorkerConnection not found'}, status=404)

    brokerconnection.delete()
    return Response({'message': 'BorkerConnection deleted successfully'}, status=204)

def sync_devices(devices):
    for item in devices:
        ids = item.get('ids', {})
        device_data = {
            'device_id': ids.get('device_id'),
            'dev_eui': ids.get('dev_eui'),
            'join_eui': ids.get('join_eui'),
            'device_name': ids.get('device_id'),
            'position_x': 0.0,
            'position_y': 0.0,
            'application_id': ids.get('application_ids', {}).get('application_id') or 'unknown-app',
        }
        EndDevice.objects.update_or_create(
            device_id=device_data['device_id'],
            defaults=device_data
        )

@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_lora_devices(request):
    try:
        server_address = os.getenv("SERVER_ADDRESS","")
        THINGS_STACK_API_URL = f"https://{server_address}/api/v3/applications/humidity-sensor/devices"
        BEARER_TOKEN = os.getenv("AUTH_TOKEN","")

        headers = {
            "Authorization": f"Bearer {BEARER_TOKEN}",
            "Content-Type": "application/json"
        }
        response = requests.get(THINGS_STACK_API_URL, headers=headers)

        if response.status_code == 200:
            data = response.json()
            devices = data.get('end_devices', [])

            for item in devices:
                ids = item.get('ids', {})
                device_data = {
                    'device_id': ids.get('device_id'),
                    'dev_eui': ids.get('dev_eui'),
                    'join_eui': ids.get('join_eui'),
                    'device_name': ids.get('device_id'),
                    'position_x': 0.0,
                    'position_y': 0.0,
                    'application_id': ids.get('application_ids', {}).get('application_id') or 'unknown-app',
                }
            
                serialiazer = EndDeviceSerializer(data=device_data)
                if(serialiazer.is_valid()):
                    serialiazer.save()

            # print("Device data:", data)
            return Response(data,status=200)
        else:
            print(f"Error {response.status_code}: {response.text}")
            return Response({'error': f'{response.text}'},status=204)
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=500)
