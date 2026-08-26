from dataclasses import dataclass
from datetime import datetime

@dataclass
class Incident:
    id: str
    name: str
    status: str = "active"
    created_at: datetime | None = None
