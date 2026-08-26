import torch


def dice_score(logits: torch.Tensor, target: torch.Tensor, threshold: float = 0.5) -> float:
    pred = (torch.sigmoid(logits) >= threshold).float()
    intersection = (pred * target).sum().item()
    denominator = pred.sum().item() + target.sum().item()
    return float((2 * intersection) / denominator) if denominator else 1.0
