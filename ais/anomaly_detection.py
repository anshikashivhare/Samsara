"""
AIS Anomaly Detection Module (Dual-Layered: Isolation Forest + DBSCAN).
"""

from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, RobustScaler


DEFAULT_ANOMALY_FEATURES = [
    "sog",
    "speed_delta",
    "heading_delta",
    "acceleration_kpm",
    "rate_of_turn_deg_min",
    "draft_delta"
]


def isolation_forest_anomalies(
    df: pd.DataFrame,
    feature_columns: Optional[List[str]] = None,
    contamination: float = 0.05,
    random_state: int = 42
) -> pd.DataFrame:
    """
    Unsupervised vessel anomaly detection using Isolation Forest (as per research paper).
    Computes anomaly scores (0 to 1) and binary anomaly flags.
    """
    out = df.copy()
    features = [f for f in (feature_columns or DEFAULT_ANOMALY_FEATURES) if f in out.columns]
    
    if len(features) == 0 or len(out) < 5:
        out["iforest_score"] = 0.0
        out["iforest_anomaly"] = False
        return out

    x_data = out[features].fillna(0.0).values
    scaler = RobustScaler()
    x_scaled = scaler.fit_transform(x_data)

    model = IsolationForest(
        contamination=contamination,
        random_state=random_state,
        n_estimators=150,
        n_jobs=-1
    )
    preds = model.fit_predict(x_scaled)
    # Decision function returns raw anomaly scores (lower is more anomalous)
    raw_scores = model.decision_function(x_scaled)
    # Normalize to 0 (normal) to 1 (highly anomalous)
    min_s, max_s = raw_scores.min(), raw_scores.max()
    normalized_score = 1.0 - ((raw_scores - min_s) / (max_s - min_s + 1e-6))

    out["iforest_score"] = np.round(normalized_score, 4)
    out["iforest_anomaly"] = preds == -1
    return out


def dbscan_anomalies(
    df: pd.DataFrame, 
    feature_columns: Optional[List[str]] = None, 
    eps: float = 0.8, 
    min_samples: int = 5
) -> pd.DataFrame:
    """
    Density-based spatial and kinematic clustering (DBSCAN / MDDBSCAN).
    Points assigned label -1 are isolated spatial/behavioral outliers.
    """
    out = df.copy()
    features = [f for f in (feature_columns or ["speed_delta", "heading_delta"]) if f in out.columns]
    
    if len(features) == 0 or len(out) < min_samples:
        out["cluster"] = 0
        out["is_anomaly"] = False
        return out

    x_data = out[features].fillna(0.0).values
    x_scaled = StandardScaler().fit_transform(x_data)
    labels = DBSCAN(eps=eps, min_samples=min_samples).fit_predict(x_scaled)
    
    out["cluster"] = labels
    out["is_anomaly"] = labels == -1
    return out


def detect_vessel_anomalies(
    df: pd.DataFrame,
    contamination: float = 0.05,
    dbscan_eps: float = 0.8
) -> pd.DataFrame:
    """
    Unified dual-layer anomaly detection pipeline:
    1. Runs Isolation Forest over multi-dimensional kinematic features
    2. Runs DBSCAN clustering to catch density outliers
    3. Fuses scores and classifies specific maritime anomaly tags
    """
    # 1. Isolation Forest
    result = isolation_forest_anomalies(df, contamination=contamination)
    
    # 2. DBSCAN
    result = dbscan_anomalies(result, eps=dbscan_eps)

    # 3. Label specific behavioral trigger categories
    speed_drop = result["speed_delta"] < -5.0 if "speed_delta" in result.columns else pd.Series(False, index=result.index)
    sharp_turn = result["heading_delta"].abs() > 45.0 if "heading_delta" in result.columns else pd.Series(False, index=result.index)
    draft_change = result["draft_delta"].abs() > 0.5 if "draft_delta" in result.columns else pd.Series(False, index=result.index)
    dark_gap = result["is_gap_break"] if "is_gap_break" in result.columns else pd.Series(False, index=result.index)

    tags = []
    for s_drop, s_turn, d_chg, gap in zip(speed_drop, sharp_turn, draft_change, dark_gap):
        t = []
        if s_drop:
            t.append("sudden_speed_drop")
        if s_turn:
            t.append("sharp_course_alteration")
        if d_chg:
            t.append("cargo_draft_change")
        if gap:
            t.append("dark_ais_gap")
        tags.append(",".join(t) if t else "normal")

    result["anomaly_tags"] = tags
    result["is_anomaly_combined"] = result["iforest_anomaly"] | result["is_anomaly"] | (result["anomaly_tags"] != "normal")
    return result

