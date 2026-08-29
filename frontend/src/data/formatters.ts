export const formatMmsi = (mmsi: string) => mmsi;

export const formatCoord = (lng: number, lat: number, digits = 4) =>
  `${Math.abs(lat).toFixed(digits)}° ${lat >= 0 ? "N" : "S"} · ${Math.abs(lng).toFixed(digits)}° ${lng >= 0 ? "E" : "W"}`;

export const formatKm = (km: number, digits = 1) => `${km.toFixed(digits)} km`;

export const formatPercent = (value: number, digits = 1) =>
  `${(value * 100).toFixed(digits)}%`;

export const formatBearing = (deg: number) => {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const i = Math.round(((deg % 360) / 22.5)) % 16;
  return `${deg.toFixed(0)}° ${dirs[i]}`;
};

export const formatSpeedKn = (kn: number) => `${kn.toFixed(1)} kn`;

export const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  return d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
};

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toUTCString().replace(":00 GMT", " UTC");
};
