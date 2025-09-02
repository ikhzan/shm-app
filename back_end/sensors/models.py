from django.db import models
    
class SensorReading(models.Model):
    device_id = models.CharField(max_length=100, null=True)
    application_id = models.CharField(max_length=100, null=True)
    timestamp = models.DateTimeField(null=True)

    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)

    sensor_data = models.JSONField(default=dict)
    raw_payload = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.device_id}"
    
class Vehicle(models.Model):
    name = models.CharField(max_length=100, null=False, default='ship')
    image_path = models.ImageField(upload_to='vehicle_images/', null=True, default='image.png')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self) -> str:
        return self.name

class LoraGateway(models.Model):
    name = models.CharField(max_length=100,default='lora gateway', null=False)
    url_path = models.CharField(max_length=100,default='url path',null=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    def __str__(self) -> str:
        return f"{self.name}"

class BrokerConnection(models.Model):
    device_name = models.CharField(max_length=100,default='device name',null=False)
    url_path = models.CharField(max_length=100,default='v3/humidity',null=False)
    gateway_path = models.CharField(max_length=100,null=True,default="gateway path")
    status = models.CharField(max_length=20,default='active',null=False)
    sensor_type = models.CharField(max_length=100, default='humidity', null=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    def __str__(self) -> str:
        return f"{self.device_name}"
    
   
class EndDevice(models.Model):
    device_id = models.CharField(max_length=100, null=False, unique=True)  # Ensure unique device IDs
    device_name = models.CharField(max_length=100, null=False, default='device name')
    device_status = models.CharField(max_length=10, null=True, default='device status')
    position_x = models.FloatField(null=False, default=25.0)  # Use FloatField for coordinates
    position_y = models.FloatField(null=False, default=55.0)
    dev_eui = models.CharField(max_length=100, default='00:00:00:00:00:00:00:11', null=True)
    join_eui = models.CharField(max_length=100, default='00:00:00:00:00:00:00:11', null=True)
    image_path = models.ImageField(upload_to='sensor_images/', null=True, default='image path')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='end_devices')
    broker = models.OneToOneField(BrokerConnection,on_delete=models.CASCADE, null=True, blank=True,related_name='end_device')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self) -> str:
        return self.device_name
