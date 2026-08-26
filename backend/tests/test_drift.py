from drift.particles import ParticleState, advect
import numpy as np


def test_advect_moves_particle():
    state = ParticleState(np.array([0.0]), np.array([0.0]))
    result = advect(state, np.array([1.0]), np.array([1.0]))
    assert result.longitude[0] > 0
    assert result.latitude[0] > 0
