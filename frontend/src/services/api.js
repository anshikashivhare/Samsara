const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function getIncidents() {
  const response = await fetch(`${API_BASE}/incidents`);
  if (!response.ok) throw new Error('Failed to load incidents');
  return response.json();
}

export async function getAttribution(incidentId) {
  const response = await fetch(`${API_BASE}/attribution/${incidentId}`);
  if (!response.ok) throw new Error('Failed to load attribution');
  return response.json();
}
