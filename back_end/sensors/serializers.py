from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = '__all__'

class EndDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EndDevice
        fields = '__all__'

class EndDevicePostSerializer(serializers.ModelSerializer):
    broker_id = serializers.PrimaryKeyRelatedField(
        queryset=BrokerConnection.objects.all(),
        source='broker',
        required=False
    )

    class Meta:
        model = EndDevice
        fields = [
            'device_id', 'device_name', 'device_status',
            'dev_eui', 'join_eui', 'image_path', 'broker_id'
        ]

class EndDeviceUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    position_x = serializers.FloatField()
    position_y = serializers.FloatField()
    class Meta:
        model = EndDevice
        fields = ['id', 'position_x','position_y']

class VehicleRelatedSerializer(serializers.ModelSerializer):
    end_devices = EndDeviceUpdateSerializer(many=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'name', 'image_path', 'end_devices']

    def create(self, validated_data):
        # Extract sensor data
        end_devices_data = validated_data.pop('end_devices', [])
        # Create the vehicle
        vehicle = Vehicle.objects.create(**validated_data)

        # Update each sensor
        for sensor_data in end_devices_data:
            try:
                sensor = EndDevice.objects.get(id=sensor_data['id'])
                sensor.position_x = sensor_data['position_x']
                sensor.position_y = sensor_data['position_y']
                sensor.vehicle = vehicle
                sensor.save()
            except EndDevice.DoesNotExist:
                continue  # Optionally log or raise

        return vehicle


class SensorPositionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    position_x = serializers.FloatField()
    position_y = serializers.FloatField()

class VehicleSerializer(serializers.ModelSerializer):
    end_devices = EndDeviceSerializer(many=True)
    class Meta:
        model = Vehicle
        fields = ['id','name','image_path','end_devices']

class BrokerConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrokerConnection
        fields = '__all__'       

class LoraGatewaySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoraGateway
        fields = '__all__'  

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Safely add user info
        user = self.user
        if user:
            data['username'] = user.username
            data['email'] = user.email  # Optional: add more fields if needed

        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
