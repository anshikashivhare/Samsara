from ml.preprocessing.normalize import robust_normalize


def preprocess_raster(image):
    return robust_normalize(image)
