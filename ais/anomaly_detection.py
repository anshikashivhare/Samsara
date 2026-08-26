import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler


def dbscan_anomalies(df: pd.DataFrame, feature_columns=None, eps=0.8, min_samples=5):
    feature_columns = feature_columns or ["speed_delta", "heading_delta"]
    x = StandardScaler().fit_transform(df[feature_columns].astype(float))
    labels = DBSCAN(eps=eps, min_samples=min_samples).fit_predict(x)
    out = df.copy()
    out["cluster"] = labels
    out["is_anomaly"] = labels == -1
    return out
