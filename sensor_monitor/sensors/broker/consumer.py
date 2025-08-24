from channels.generic.websocket import AsyncWebsocketConsumer
import json

# Global registry for connected clients (single-process only)
connected_clients = set()

class TTNConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        connected_clients.add(self)
        await self.accept()

        client_info = self.scope.get('client')
        if client_info:
            print(f"WebSocket connected from: {client_info[0]}:{client_info[1]}")
        else:
            print("WebSocket connected: client info unavailable")


    async def disconnect(self, code):
        connected_clients.discard(self)
        print(f"Client disconnected with code {code}")

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            print("Received text from frontend:", text_data)
        if bytes_data:
            print("Received binary from frontend:", bytes_data)

    async def send_ttn_message(self, message):
        try:
            await self.send(text_data=json.dumps(message))
        except Exception as e:
            print(f"Error sending message to {self.channel_name}: {e}")