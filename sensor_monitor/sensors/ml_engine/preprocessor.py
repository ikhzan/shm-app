# def prepare_input(raw_data):
#     # Apply normalization or filtering
#     cleaned = [float(val) for val in raw_data if val is not None]
#     return cleaned

def prepare_input(raw_data):
    if not raw_data:
        return [0.0] * 10  # or however many features your model expects
    return [float(val) for val in raw_data if val is not None]
