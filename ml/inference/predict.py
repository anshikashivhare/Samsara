import torch
from ml.models.unet import UNet


def load_model(weights_path: str | None = None, device: str = "cpu"):
    model = UNet().to(device)
    if weights_path:
        state = torch.load(weights_path, map_location=device)
        model.load_state_dict(state)
    model.eval()
    return model


def predict(model, image: torch.Tensor) -> torch.Tensor:
    with torch.no_grad():
        return torch.sigmoid(model(image))
