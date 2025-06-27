import torch
import torch.nn as nn

# Dummy model: 1 hidden layer, ReLU activation
class SensorNet(nn.Module):
    def __init__(self, input_size=10):
        super(SensorNet, self).__init__()
        self.fc1 = nn.Linear(input_size, 16)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(16, 1)  # Output: single value (e.g. anomaly score)

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        return self.fc2(x)

# Instantiate and save
model = SensorNet()
torch.save(model.state_dict(), 'sensor_model_weights.pt')
# torch.save(model, 'models/sensor_model.pt')
print("✅ Dummy model saved to models/sensor_model.pt")