export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "active" | "monitoring" | "closed";
export type AnomalyLevel = "high" | "medium" | "low" | "none";

export interface Coordinate {
  lng: number;
  lat: number;
}

export interface Incident {
  id: string;
  region: string;
  detectedAt: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  spillAreaKm2: number;
  detectionConfidence: number;
  topSuspectScore: number;
  candidateCount: number;
  satelliteSource: string;
  origin: Coordinate;
  centroid: Coordinate;
  brief: string;
}

export interface Vessel {
  mmsi: string;
  name: string;
  flag: string;
  type: string;
  score: number;
  anomaly: AnomalyLevel;
  distanceKm: number;
  bearingDeg: number;
  speedKn: number;
  courseDeg: number;
  lastSeen: string;
  behaviourFlags: string[];
  spatialScore: number;
  temporalScore: number;
  trajectoryScore: number;
  behaviourScore: number;
  driftScore: number;
}

export interface SpillPolygon {
  id: string;
  areaKm2: number;
  confidence: number;
  detectedAt: string;
  satellite: string;
  centroid: Coordinate;
  bbox: [Coordinate, Coordinate];
}

export interface OriginZone {
  id: string;
  probability: number;
  centroid: Coordinate;
  radiusKm: number;
  earliestEstimate: string;
  latestEstimate: string;
  particleCount: number;
}

export interface DriftPoint {
  t: number;
  particles: number;
  meanDistanceKm: number;
}

export interface EvidenceComponent {
  key: "spatial" | "temporal" | "trajectory" | "behaviour" | "drift";
  label: string;
  description: string;
  weight: number;
  contribution: number;
  value: number;
  detail: string;
}

export interface InvestigationData {
  incident: Incident;
  spill: SpillPolygon;
  originZones: OriginZone[];
  vessels: Vessel[];
  evidence: EvidenceComponent[];
  driftSeries: DriftPoint[];
  timeline: { t: number; label: string }[];
}

export type InvestigationPriority = "high" | "medium" | "low";

export interface VesselProbability {
  mmsi: string;
  probability: number;
  confidencePct: number;
  priority: InvestigationPriority;
  rationale: string;
}

export interface RankedCandidate {
  rank: number;
  vessel: Vessel;
  probability: VesselProbability;
}
