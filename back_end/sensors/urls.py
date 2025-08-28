from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView

urlpatterns = [
    path('', views.home_page, name='home'),
    path('analyze/', views.analyze_sensor_data, name='analyze_sensor_data'),
    path('create/', views.create_reading, name='create reading'),
    path('insert/', views.insert_sensor_data), 
    path('all/', views.view_all_sensor_data),
    path('start-mqtt/', views.start_mqtt_now),
    path('ask/', views.query_llm),
    path('endall/', views.all_enddevice),
    path('create_device/', views.create_enddevice),
    path('update_device/', views.update_enddevice),
    path('delete_device/', views.delete_enddevice),
    path('create_broker/', views.create_brokerconnection),
    path('read_broker/', views.read_brokerconnection),
    path('update_broker/', views.update_brokerconnection),
    path('delete_broker/', views.delete_brokerconnection),
    path('detail_sensor/', views.sensor_detail),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]