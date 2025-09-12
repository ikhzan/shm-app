# shm-app
- it supports sensor monitoring data
- it supports data analysis and ai integration
- consits of back-end and front-end infrastructure
- communication with message broker mqtt
- current production example at https://shmapp.online

# Core Stack Overview:
- Backend: Django + Django REST Framework (DRF)
- Machine Learning: TensorFlow + PyTorch (for different models or inference engines)
- Database: MongoDB (via djongo or mongoengine)
- Frontend: angular (for interactive UI with real-time updates)
- Sensor Data Stream: Handled via WebSockets or polling endpoints

![Broker screen](./front_end/screenshots/broker-screen.png)
![Sensor screen](./front_end/screenshots/sensor-screen.png)
![Chat screen](./front_end/screenshots/chat-screen.png)

test uplink payload format in stacks in byte
0E 42 09 24 02 26 87 04 00 00 00

decoding
0E 42 = battery level
09 24 = temperature 
02 26 = humidity
87    = Flags: Ext = 7, Connect = 1, Poll = 0
04 00 = interupt count
00 00 = padding