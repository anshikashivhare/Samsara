import numpy as np


def random_flip(image: np.ndarray, mask: np.ndarray, rng=None):
    rng = rng or np.random.default_rng()
    if rng.random() < 0.5:
        image, mask = np.flip(image, axis=-1).copy(), np.flip(mask, axis=-1).copy()
    if rng.random() < 0.5:
        image, mask = np.flip(image, axis=-2).copy(), np.flip(mask, axis=-2).copy()
    return image, mask
