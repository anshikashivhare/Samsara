from pathlib import Path
import torch
from torch import optim

from ml.models.unet import UNet
from ml.models.losses import DiceBCELoss


def train_one_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total = 0.0
    for images, masks in loader:
        images, masks = images.to(device), masks.to(device)
        optimizer.zero_grad(set_to_none=True)
        loss = criterion(model(images), masks)
        loss.backward()
        optimizer.step()
        total += loss.item()
    return total / max(len(loader), 1)


def build_model(in_channels: int = 1):
    return UNet(in_channels=in_channels, out_channels=1)


if __name__ == "__main__":
    # Dataset/DataLoader wiring is intentionally project-specific; this entrypoint
    # provides the reproducible model/optimizer/loss building blocks.
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = build_model().to(device)
    optimizer = optim.AdamW(model.parameters(), lr=1e-4)
    criterion = DiceBCELoss()
    print(f"Samsara training ready on {device}; parameters={sum(p.numel() for p in model.parameters()):,}")
