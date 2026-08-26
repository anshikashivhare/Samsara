CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS spills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    detected_at TIMESTAMPTZ,
    area_km2 DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    geometry GEOMETRY(MULTIPOLYGON, 4326)
);
CREATE TABLE IF NOT EXISTS vessels (
    mmsi BIGINT PRIMARY KEY,
    name TEXT,
    vessel_type TEXT
);
CREATE TABLE IF NOT EXISTS vessel_positions (
    id BIGSERIAL PRIMARY KEY,
    mmsi BIGINT REFERENCES vessels(mmsi),
    observed_at TIMESTAMPTZ NOT NULL,
    speed_knots DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    geometry GEOMETRY(POINT, 4326)
);
CREATE TABLE IF NOT EXISTS origin_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    probability DOUBLE PRECISION,
    geometry GEOMETRY(POLYGON, 4326)
);
CREATE TABLE IF NOT EXISTS suspect_scores (
    id BIGSERIAL PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    mmsi BIGINT REFERENCES vessels(mmsi),
    score DOUBLE PRECISION NOT NULL,
    evidence JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS investigation_events (
    id BIGSERIAL PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spills_geom ON spills USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_positions_geom ON vessel_positions USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_origins_geom ON origin_zones USING GIST(geometry);
