from ais.cleaning import clean_positions
from ais.features import behavioural_features
from ais.anomaly_detection import dbscan_anomalies

class AISService:
    def process(self, dataframe):
        cleaned = clean_positions(dataframe)
        features = behavioural_features(cleaned)
        return dbscan_anomalies(features)
