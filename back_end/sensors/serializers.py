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

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['name','image_path','end_devices']

class BrokerConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BorkerConnection
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
