import torch
from ml.models.metrics import dice_score


def evaluate(model, loader, device="cpu"):
    model.eval()
    scores = []
    with torch.no_grad():
        for images, masks in loader:
            logits = model(images.to(device))
            scores.append(dice_score(logits.cpu(), masks))
    return sum(scores) / max(len(scores), 1)
