import os
from django.shortcuts import render
from ml_engine import run_inference, prepare_input, predict
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SensorReading
import datetime
from .serializers import *
from dotenv import load_dotenv
import ollama
from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes

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
def analyze_sensor_data(request):
    data = request.data.get('data')
    prediction = run_inference(data)
    
    # Optionally store the reading + result
    SensorReading(
        sensor_id=request.data.get('sensor_id', 'unknown'),
        data={'values': data},  # optional: wrap raw data too
        prediction={'torch': prediction}  # 👈 wrap as dict
    ).save()

    return Response({'prediction': prediction})


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


def generate_response(prompt):
    stream = ollama.chat(
        model='llama3.2:latest',
        messages=[{'role': 'user', 'content': prompt}],
        stream=True
    )
    for chunk in stream:
        yield chunk['message']['content']

@api_view(['POST'])
def query_llm(request):
    prompt = request.data.get('prompt')
    return StreamingHttpResponse(generate_response(prompt), content_type='text/plain')


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
    serializer = VehicleSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
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
    serializer = EndDeviceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Read
@api_view(['GET'])
def all_enddevice(request):
    enddevices = EndDevice.objects.all()
    serializer = EndDeviceSerializer(enddevices,many=True)
    return Response(serializer.data)

@api_view(['GET'])
def sensor_detail(request):
    device_id = request.query_params.get('sensor_id')
    if not device_id:
        return Response({"error": "Missing sensor_id in query parameters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        sensor_data = SensorReading.objects.filter(device_id=device_id)
        serializer = SensorReadingSerializer(sensor_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as ex:
        print(f"Error fetching sensor data: {ex}")
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Update
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_enddevice(request):
    pk = request.query_params.get('id')
    if not pk:
        return Response({'error': 'Missing id parameter'}, status=400)
    try:
        enddevice = EndDevice.objects.get(pk=pk)
    except EndDevice.DoesNotExist:
        return Response({'error': 'EndDevice not found'}, status=404)

    serializer = EndDeviceSerializer(enddevice, data=request.data)
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
    brokerconnections = BorkerConnection.objects.all()
    serializer = BrokerConnectionSerializer(brokerconnections,many=True)
    return Response(serializer.data)

# Update
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_brokerconnection(request, pk):
    try:
        brokerconnections = BorkerConnection.objects.get(pk=pk)
    except BorkerConnection.DoesNotExist:
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
        brokerconnection = BorkerConnection.objects.get(pk=pk)
    except BorkerConnection.DoesNotExist:
        return Response({'error': 'BorkerConnection not found'}, status=404)

    brokerconnection.delete()
    return Response({'message': 'BorkerConnection deleted successfully'}, status=204)
