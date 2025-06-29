import os
from django.shortcuts import render
from sensors.ml_engine import run_inference, prepare_input, predict
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SensorReading
import datetime
from .serializers import *
import openai
from dotenv import load_dotenv
import threading
import ollama
from django.http import StreamingHttpResponse
load_dotenv()

@api_view(['POST'])
def create_reading(request):
    reading = SensorReading(**request.data)
    reading.save()
    return Response({'status': 'saved'})

@api_view(['POST'])
def insert_sensor_data(request):
    sensor_id = request.data.get('sensor_id')
    data = request.data.get('data')
    timestamp = request.data.get('timestamp', datetime.datetime.utcnow())

    if not sensor_id or not data:
        return Response({'error': 'sensor_id and data are required'}, status=400)

    SensorReading(
        sensor_id=sensor_id,
        data={'values': data},
        timestamp=timestamp
    ).save()

    return Response({'status': '✅ Data inserted successfully'})

@api_view(['GET'])
def view_all_sensor_data(request):
    readings = SensorReading.objects.order_by('-timestamp')[:100]  # latest 100
    serializer = SensorReadingSerializer(readings, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def analyze_sensor_data(request):
    data = request.data.get('data')
    prediction = run_inference(data)
    
    # Optionally store the reading + result
    SensorReading(
        sensor_id=request.data.get('sensor_id', 'unknown'),
        data={'values': data},  # optional: wrap raw data too
        prediction={'torch': prediction}  # 👈 wrap as dict
    ).save()

    return Response({'prediction': prediction})


@api_view(['POST'])
def start_mqtt_now(request):
    try:
        from sensors.broker.mqtt_client import start_mqtt_in_thread
        start_mqtt_in_thread()
        return Response({'status': '✅ MQTT client started'})
    except Exception as e:
        return Response({'error': f'❌ Failed to start MQTT: {e}'}, status=500)


def home_page(request):
    return render(request, 'home.html')


def generate_response(prompt):
    stream = ollama.chat(
        model='llama3.2:latest',
        messages=[{'role': 'user', 'content': prompt}],
        stream=True
    )
    for chunk in stream:
        yield chunk['message']['content']

@api_view(['POST'])
def query_llm(request):
    prompt = request.data.get('prompt')
    return StreamingHttpResponse(generate_response(prompt), content_type='text/plain')

