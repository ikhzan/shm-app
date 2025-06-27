from django.db import models

# Create your models here.
from mongoengine import Document, StringField, DateTimeField, DictField
import datetime

class SensorReading(Document):
    sensor_id = StringField(required=True)
    timestamp = DateTimeField(default=datetime.datetime.utcnow)
    data = DictField()
    prediction = DictField()