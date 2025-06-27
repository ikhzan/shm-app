# mqtt_client.py (inside your app, e.g. sensors/mqtt_client.py)

import os
import json
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
import threading

load_dotenv()

def start_mqtt():
    broker = os.getenv("MQTT_BROKER")
    port = int(os.getenv("MQTT_PORT", 1883))
    username = os.getenv("MQTT_USERNAME")
    password = os.getenv("MQTT_PASSWORD")
    topics = os.getenv("MQTT_TOPICS", "").split(',')

    def on_connect(client, userdata, flags, rc):
        print(f"MQTT connected with code {rc}")
        for topic in topics:
            client.subscribe(topic)
            print(f"Subscribed to {topic}")

    def on_message(client, userdata, msg):
        print(f"[{msg.topic}] {msg.payload.decode()}")

    client = mqtt.Client()
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker, port, 60)
    client.loop_start()  # ✅ Non-blocking

# Optional: run in a thread if needed
def start_mqtt_in_thread():
    try:
        threading.Thread(target=start_mqtt, daemon=True).start()
    except Exception as ex:
        print(f"Error starting mqtt, {ex}")