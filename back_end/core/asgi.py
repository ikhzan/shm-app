"""
ASGI config for sensor_monitor project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from sensors.broker import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(routing.websocket_urlpatterns)
    ),
})



# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from . import routing

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project_name.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter(
#             routing.websocket_urlpatterns
#         )
#     ),
# })

