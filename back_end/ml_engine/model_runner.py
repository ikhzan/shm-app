import torch
from pathlib import Path
from .sensor_net import SensorNet
from .preprocessor import prepare_input

# Register SensorNet as a safe global
torch.serialization.add_safe_globals({'__main__.SensorNet': SensorNet})

# Load model
MODEL_PATH = Path(__file__).resolve().parent / "models" / "sensor_model_weights.pt"
model = SensorNet()
model.load_state_dict(torch.load(MODEL_PATH, map_location='cpu'))
model.eval()

def run_inference(raw_data):
    input_tensor = torch.tensor(prepare_input(raw_data), dtype=torch.float32).unsqueeze(0)
    with torch.no_grad():
        output = model(input_tensor)
    return output.item()


def predict(input_data):
    with torch.no_grad():
        tensor = torch.tensor(input_data).float()
        result = model(tensor)
    return result.tolist()
