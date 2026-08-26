from .particles import ParticleState, advect


def hindcast(state: ParticleState, current_u, current_v, hours: int = 48):
    history = [state]
    for _ in range(hours):
        # Reverse-time approximation for MVP; production should use time-indexed fields.
        state = advect(state, -current_u, -current_v)
        history.append(state)
    return history
