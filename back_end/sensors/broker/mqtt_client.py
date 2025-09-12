import os
import json
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
import threading
from .consumer import connected_clients
import asyncio
from ..models import SensorReading, BrokerConnection, EndDevice
from ..serializers import EndDeviceLastDataSerializer
from django.utils.dateparse import parse_datetime
from django.utils.timezone import now

load_dotenv()

def load_brokers():
    brokerconnections = BrokerConnection.objects.all()
    url_paths = [broker.url_path for broker in brokerconnections]
    return url_paths

def create_sensor_reading(device_info, data, decoded, location):
    try:
        # Only extract sensor_data if decoded is a dict
        sensor_data = (
            {k: v for k, v in decoded.items() if v is not None}
            if isinstance(decoded, dict)
            else {}
        )

        raw_ts = data.get("received_at")

        if isinstance(raw_ts, str):
            # Normalize Zulu time and try parsing
            timestamp = parse_datetime(raw_ts.replace("Z", "+00:00"))
            if not timestamp:
                timestamp = now()
        else:
            timestamp = now()

        latitude=location.get("latitude") if location else None
        longitude=location.get("longitude") if location else None

        sensor_data["latitude"] = latitude
        sensor_data["longitude"] = longitude

        reading = SensorReading(
            device_id = device_info.get("device_id"),
            application_id = device_info.get("application_ids", {}).get("application_id"),
            timestamp = timestamp,
            latitude = latitude,
            longitude = longitude,
            sensor_data = sensor_data,
            raw_payload = data
        )
        reading.save()
        update_enddevice(device_info.get("device_id"),sensor_data)
        print(f"✅ Saved reading from {reading.device_id} at {reading.timestamp}")
        return reading

    except Exception as e:
        print(f"❌ create_sensor_reading Error parsing TTN payload: {e}")

def update_enddevice(device_id, last_data):
    try:
        enddevice = EndDevice.objects.filter(device_id=device_id).first()
        if not enddevice:
            print(f"EndDevice with device_id {device_id} not found.")
            return

        data = {'last_data': last_data}
        serializer = EndDeviceLastDataSerializer(enddevice, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return serializer.data
        else:
            print(f"Serializer errors: {serializer.errors}")

    except Exception as ex:
        print(f"Error updating end device: {ex}")


def handle_ttn_payload(data):
    try:
        device_info = data.get("end_device_ids", {})
        uplink = data.get("uplink_message", {})
        decoded = uplink.get("decoded_payload")

        # Ensure decoded is a dict with at least one sensor value
        if isinstance(decoded, dict) and decoded:
            location = uplink.get("locations", {}).get("user") or {}
            create_sensor_reading(device_info, uplink, decoded, location)
        else:
            print(f"⚠️ Skipping reading: No valid decoded payload for device {device_info.get('device_id')}")
    except Exception as e:
        print(f"Error parsing TTN payload: {e}")


def start_mqtt():
    broker = os.getenv("MQTT_BROKER","")
    port = int(os.getenv("MQTT_PORT", 1883))
    username = os.getenv("MQTT_USERNAME")
    password = os.getenv("MQTT_PASSWORD")
    topics = load_brokers()

    def on_connect(client, userdata, flags, rc):
        print(f"MQTT connected with code {rc}")
        for topic in topics:
            client.subscribe(topic)
            print(f"Subscribed to {topic}")

    def on_message(client, userdata, msg):
        payload_str = msg.payload.decode()
        payload = json.loads(payload_str)
        print(f"[{msg.topic}] {payload}")
        print("send data to handle payload")
        handle_ttn_payload(payload)

        uplink = payload.get("uplink_message", {})
        decoded = uplink.get("decoded_payload", {})
        location = uplink.get("locations", {}).get("user")

        message = {
            "device_id": payload.get("end_device_ids", {}).get("device_id"),
            "application_id": payload.get("end_device_ids", {}).get("application_ids", {}).get("application_id"),
            "timestamp": payload.get("received_at"),
            "battery": decoded.get("BatV"),
            "humidity": decoded.get("Hum_SHT"),
            "temperature": decoded.get("TempC_SHT"),
            "location": location if location else {}
        }

        print(f"Broadcasting to {len(connected_clients)} clients")

        for client in list(connected_clients):
            try:
                asyncio.run(client.send_ttn_message(message))
                print(f"Active WebSocket: {client.__class__.__name__}")
            except Exception as e:
                print(f"Failed to send to client: {e}")


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