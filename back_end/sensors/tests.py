from django.test import TestCase

# Create your tests here.
import random

def generate_sensor_payload():
    # Simulate battery voltage between 3.3V and 3.7V
    bat_mv = random.randint(3300, 3700)
    bat_bytes = [(bat_mv >> 8) & 0xFF, bat_mv & 0xFF]

    # Simulate temperature between 20°C and 30°C
    temp_c = round(random.uniform(20.0, 30.0), 2)
    temp_raw = int(temp_c * 100)
    temp_bytes = [(temp_raw >> 8) & 0xFF, temp_raw & 0xFF]

    # Simulate humidity between 40% and 60%
    hum = round(random.uniform(40.0, 60.0), 1)
    hum_raw = int(hum * 10)
    hum_bytes = [(hum_raw >> 8) & 0xFF, hum_raw & 0xFF]

    # Ext byte: Ext = 7, Connect = 1, Poll = 0 → 0x87
    ext_byte = [0x87]

    # Simulate interrupt count
    count = random.randint(0, 5000)
    count_bytes = [(count >> 8) & 0xFF, count & 0xFF]

    # Padding
    pad = [0x00, 0x00]

    # Combine all bytes
    payload_bytes = bat_bytes + temp_bytes + hum_bytes + ext_byte + count_bytes + pad
    hex_payload = ''.join(f'{b:02X}' for b in payload_bytes)
    return hex_payload