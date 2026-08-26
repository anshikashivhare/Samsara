from dataclasses import dataclass
import numpy as np


@dataclass
class ParticleState:
    longitude: np.ndarray
    latitude: np.ndarray


def advect(state: ParticleState, u: np.ndarray, v: np.ndarray, dt_hours: float = 1.0) -> ParticleState:
    """Simple local-degree approximation; replace with geodesic integration for production."""
    lon = state.longitude + u * dt_hours / 111.32
    lat = state.latitude + v * dt_hours / 111.32
    return ParticleState(lon, lat)
