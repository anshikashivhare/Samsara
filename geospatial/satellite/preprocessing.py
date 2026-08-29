"""
Satellite SAR Preprocessing & Texture Feature Extraction Module (GLCM).
"""

from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import cv2
from skimage.feature import graycomatrix, graycoprops
from skimage.measure import shannon_entropy


def preprocess_sar_image(
    image: np.ndarray,
    target_size: Optional[Tuple[int, int]] = (256, 256),
    denoise: bool = True
) -> np.ndarray:
    """
    Preprocesses raw satellite SAR image:
    - Converts to single-channel 8-bit grayscale
    - Applies median / bilateral filtering for speckle noise reduction
    - Normalizes intensity levels
    """
    if image.ndim == 3:
        if image.shape[2] == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        elif image.shape[2] == 4:
            gray = cv2.cvtColor(image, cv2.COLOR_RGBA2GRAY)
        else:
            gray = image[:, :, 0]
    else:
        gray = image.copy()

    # Normalize to 0..255 uint8
    if gray.dtype != np.uint8:
        min_v, max_v = float(np.min(gray)), float(np.max(gray))
        if max_v > min_v:
            gray = np.clip((gray - min_v) / (max_v - min_v) * 255.0, 0, 255).astype(np.uint8)
        else:
            gray = np.zeros_like(gray, dtype=np.uint8)

    if denoise:
        # Median filter to suppress SAR speckle noise
        gray = cv2.medianBlur(gray, 3)

    if target_size is not None:
        gray = cv2.resize(gray, target_size, interpolation=cv2.INTER_AREA)

    return gray


def extract_glcm_texture_features(
    patch: np.ndarray,
    distances: Optional[List[int]] = None,
    angles: Optional[List[float]] = None
) -> Dict[str, float]:
    """
    Extracts Gray-Level Co-occurrence Matrix (GLCM) statistical texture features
    as described in the research paper for distinguishing oil slicks from look-alikes.
    
    Features extracted:
    - Contrast
    - Dissimilarity
    - Homogeneity
    - Energy (ASM)
    - Correlation
    - Entropy
    - Mean and Standard Deviation
    """
    if patch.ndim == 3:
        patch = cv2.cvtColor(patch, cv2.COLOR_RGB2GRAY)
    if patch.dtype != np.uint8:
        patch = np.clip(patch, 0, 255).astype(np.uint8)

    if distances is None:
        distances = [1, 3]
    if angles is None:
        angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]

    # Compute GLCM matrix
    glcm = graycomatrix(patch, distances=distances, angles=angles, levels=256, symmetric=True, normed=True)

    contrast = float(np.mean(graycoprops(glcm, 'contrast')))
    dissimilarity = float(np.mean(graycoprops(glcm, 'dissimilarity')))
    homogeneity = float(np.mean(graycoprops(glcm, 'homogeneity')))
    energy = float(np.mean(graycoprops(glcm, 'energy')))
    correlation = float(np.mean(graycoprops(glcm, 'correlation')))
    entropy = float(shannon_entropy(patch))
    mean_intensity = float(np.mean(patch))
    std_intensity = float(np.std(patch))

    return {
        "glcm_contrast": np.round(contrast, 4),
        "glcm_dissimilarity": np.round(dissimilarity, 4),
        "glcm_homogeneity": np.round(homogeneity, 4),
        "glcm_energy": np.round(energy, 4),
        "glcm_correlation": np.round(correlation, 4),
        "entropy": np.round(entropy, 4),
        "mean_intensity": np.round(mean_intensity, 2),
        "std_intensity": np.round(std_intensity, 2)
    }


def preprocess_raster(image):
    return preprocess_sar_image(image)


if __name__ == "__main__":
    print("Executing SAR Image Preprocessing & GLCM Texture Extraction...")
    # Generate a sample synthetic SAR satellite patch
    sample_patch = np.random.randint(40, 200, size=(256, 256, 3), dtype=np.uint8)
    print(f"Input image shape: {sample_patch.shape}, dtype: {sample_patch.dtype}")
    
    # Preprocess
    preprocessed = preprocess_sar_image(sample_patch, target_size=(256, 256), denoise=True)
    print(f"Preprocessed SAR image shape: {preprocessed.shape}, dtype: {preprocessed.dtype}")
    print(f"Intensity range: [{preprocessed.min()}, {preprocessed.max()}]")
    
    # Extract GLCM texture features
    features = extract_glcm_texture_features(preprocessed)
    print("\nExtracted GLCM Texture & Statistical Features:")
    for k, v in features.items():
        print(f"  - {k}: {v}")


