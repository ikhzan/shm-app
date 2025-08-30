from django.contrib import admin
from .models import *

admin.site.register(SensorReading)
admin.site.register(EndDevice)
admin.site.register(BorkerConnection)
admin.site.register(Vehicle)
admin.site.register(LoraGateway)