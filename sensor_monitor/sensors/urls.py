from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_page, name='home'),
    path('analyze/', views.analyze_sensor_data, name='analyze_sensor_data'),
    path('create/', views.create_reading, name='create reading'),
    path('insert/', views.insert_sensor_data), 
    path('all/', views.view_all_sensor_data),
    path('start-mqtt/', views.start_mqtt_now),
]