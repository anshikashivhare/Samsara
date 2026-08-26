INSERT INTO vessels (mmsi, name, vessel_type) VALUES
(419001234, 'Sample Vessel A', 'Cargo'),
(419005678, 'Sample Vessel B', 'Tanker'),
(419009876, 'Sample Vessel C', 'Cargo')
ON CONFLICT (mmsi) DO NOTHING;
