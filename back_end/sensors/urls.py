from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView

urlpatterns = [
    path('', views.home_page, name='home'),
    path('create/', views.create_reading, name='create reading'),
    path('insert/', views.insert_sensor_data), 
    path('all/', views.view_all_sensor_data),
    path('start-mqtt/', views.start_mqtt_now),
    path('all_enddevice/', views.all_enddevice),
    path('create_device/', views.create_enddevice),
    path('update_device/', views.update_enddevice),
    path('delete_device/', views.delete_enddevice),
    path('create_broker/', views.create_brokerconnection),
    path('read_broker/', views.read_brokerconnection),
    path('update_broker/', views.update_brokerconnection),
    path('delete_broker/', views.delete_brokerconnection),
    path('detail_sensor/', views.sensor_detail),
    path('create_vehicle/', views.create_vehicle),
    path('all_vehicle/', views.all_vehicle),
    path('detail_vehicle/',views.vehicle_detail),
    path('linked_devices/',views.linked_sensor_device),
    path('update_vehicle/', views.update_vehicle),
    path('delete_vehicle/', views.delete_vehicle),
    path('create_gateway/', views.create_gateway),
    path('all_gateway/', views.all_gateway),
    path('update_gateway/', views.update_gateway),
    path('delete_gateway/', views.delete_gateway),
    path('lora/devices/', views.get_lora_devices),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]