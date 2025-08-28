import torch.nn as nn

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
