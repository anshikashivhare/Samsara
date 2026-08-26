# Samsara Architecture

Samsara is organized as a pipeline from remote sensing to explainable vessel attribution.

```text
Satellite imagery -> U-Net segmentation -> spill polygons
                                           |
Ocean currents + wind -> drift model ------+-> probable origin zones
                                           |
AIS -> cleaning -> trajectories -> features -> anomaly detection
                                           |
                                           +-> attribution engine
                                                spatial + temporal + trajectory
                                                + behaviour + drift scores
                                                         |
                                                         v
                                                  vessel ranking
                                                         |
                                                         v
                                              FastAPI -> React dashboard
                                                         |
                                                         v
                                                PostgreSQL + PostGIS
```

The architecture deliberately separates ML, geospatial processing, ocean modelling, AIS analytics, attribution, API services, UI, and persistence so each layer can evolve independently.
