from dataclasses import dataclass

@dataclass
class Vessel:
    mmsi: int
    name: str | None = None
    vessel_type: str | None = None
