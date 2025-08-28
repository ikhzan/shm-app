from django.contrib import admin
from .models import *

admin.site.register(SensorReading)
admin.site.register(EndDevice)
admin.site.register(BorkerConnection)