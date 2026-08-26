from drift.hindcast import hindcast
from drift.forecast import forecast

class DriftService:
    def run_forecast(self, state, u, v, hours=48):
        return forecast(state, u, v, hours)

    def run_hindcast(self, state, u, v, hours=48):
        return hindcast(state, u, v, hours)
