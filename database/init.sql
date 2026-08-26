CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oil_spills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    detected_at TIMESTAMPTZ,
    area_km2 DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vessel_positions (
    id BIGSERIAL PRIMARY KEY,
    mmsi BIGINT NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    speed_knots DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    geometry GEOMETRY(POINT, 4326)
);

CREATE TABLE IF NOT EXISTS vessel_trajectories (
    id BIGSERIAL PRIMARY KEY,
    mmsi BIGINT NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    geometry GEOMETRY(LINESTRING, 4326),
    anomaly_score DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS origin_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    probability DOUBLE PRECISION,
    geometry GEOMETRY(POLYGON, 4326)
);

CREATE TABLE IF NOT EXISTS suspect_scores (
    id BIGSERIAL PRIMARY KEY,
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    mmsi BIGINT NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    explanation JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investigation_events (
    id BIGSERIAL PRIMARY KEY,
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oil_spills_geometry ON oil_spills USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_vessel_positions_geometry ON vessel_positions USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_origin_zones_geometry ON origin_zones USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_vessel_positions_mmsi_time ON vessel_positions (mmsi, observed_at);
