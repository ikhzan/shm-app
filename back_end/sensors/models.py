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

class EndDevice(models.Model):
    device_name = models.CharField(max_length=100,null=False,default='device name')
    device_status = models.CharField(max_length=10,null=True,default='device status')
    image_path = models.CharField(max_length=100,null=True, default='image path')
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    def __str__(self) -> str:
        return f"{self.device_name}"

class BorkerConnection(models.Model):
    device_name = models.CharField(max_length=100,default='device name',null=False)
    url_path = models.CharField(max_length=100,default='v3/humidity',null=False)
    gateway_path = models.CharField(max_length=100,null=True,default="gateway path")
    status = models.CharField(max_length=20,default='active',null=False)
    sensor_type = models.CharField(max_length=100, default='humidity', null=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    def __str__(self) -> str:
        return f"{self.device_name}"

