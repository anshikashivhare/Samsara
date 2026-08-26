from ml.inference.predict import load_model, predict

class DetectionService:
    def __init__(self, weights_path=None, device="cpu"):
        self.model = load_model(weights_path, device)
        self.device = device

    def detect(self, image_tensor):
        return predict(self.model, image_tensor.to(self.device))
