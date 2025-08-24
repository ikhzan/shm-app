from django.db import models

class SensorReading(models.Model):
    device_id = models.CharField(max_length=64)
    application_id = models.CharField(max_length=64)
    timestamp = models.DateTimeField()
    
    battery_voltage = models.FloatField(null=True)
    battery_status = models.IntegerField(null=True)
    external_sensor = models.CharField(max_length=128, null=True)
    
    humidity = models.FloatField(null=True)
    temp_sht = models.FloatField(null=True)
    temp_ds = models.FloatField(null=True)
    
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)

    raw_payload = models.JSONField() 

    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    def __str__(self) -> str:
        return f"{self.device_id}"


class EndDevice(models.Model):
    device_name = models.CharField(max_length=100)
    device_status = models.CharField(max_length=10)
    url_path = models.CharField(max_length=100)
    gateway_path = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    def __str__(self) -> str:
        return f"{self.device_name}"

