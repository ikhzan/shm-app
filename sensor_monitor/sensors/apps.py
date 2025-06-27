from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class SensorsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sensors'

    def ready(self):
        try:
            from sensors.broker.mqtt_client import start_mqtt_in_thread
            start_mqtt_in_thread()
            logger.info("✅ MQTT client started successfully.")
        except Exception as e:
            logger.warning(f"⚠️ MQTT client failed to start: {e}")
