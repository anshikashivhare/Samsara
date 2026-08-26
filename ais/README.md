# AIS Processing

Pipeline: ingestion -> cleaning -> geographic/time filtering -> trajectory construction -> behavioural features -> DBSCAN anomaly detection -> attribution features.

Expected core fields: `mmsi`, `timestamp`, `latitude`, `longitude`; optional `speed_knots` and `heading` improve behavioural analysis.
