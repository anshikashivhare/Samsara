from .particles import ParticleState, advect


def forecast(state: ParticleState, current_u, current_v, hours: int = 48):
    history = [state]
    for _ in range(hours):
        state = advect(state, current_u, current_v)
        history.append(state)
    return history
