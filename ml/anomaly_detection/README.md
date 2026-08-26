# AIS anomaly detection

AIS processing will use Pandas, GeoPandas, Shapely and Scikit-learn.

Initial behavioural features:

- speed changes
- heading changes
- distance to predicted spill origin
- time-window overlap with drift backtracking
- route deviation
- loitering / unusual stops

DBSCAN can identify spatial or behavioural clusters/outliers. XGBoost is an optional later-stage model for suspect ranking once labelled investigation data exists.
