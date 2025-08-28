from rest_framework import serializers
from .models import SensorReading, EndDevice, BorkerConnection
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

class BrokerConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BorkerConnection
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
