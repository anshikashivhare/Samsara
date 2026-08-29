import asyncio
import json
import random
import time
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

router = APIRouter()

# Live simulated vessels around Galveston / Gulf of Mexico
LIVE_VESSELS = [
    {"mmsi": 258758000, "name": "HOEGH SHANGHAI", "flag": "NO", "type": "Vehicle Carrier", "lat": 28.61902, "lon": -94.96906, "speed_knots": 14.2, "heading": 92.0, "risk": "HIGH", "score": 91.8},
    {"mmsi": 419001234, "name": "MT OCEAN PRIDE", "flag": "IN", "type": "Crude Oil Tanker", "lat": 28.58210, "lon": -94.89420, "speed_knots": 11.5, "heading": 104.5, "risk": "MEDIUM", "score": 64.2},
    {"mmsi": 211281610, "name": "NORDIC STAR", "flag": "DK", "type": "Bulk Carrier", "lat": 28.66540, "lon": -95.04100, "speed_knots": 15.8, "heading": 85.0, "risk": "LOW", "score": 28.4},
    {"mmsi": 372002000, "name": "PACIFIC GLORY", "flag": "PA", "type": "Container Ship", "lat": 28.51200, "lon": -94.81000, "speed_knots": 18.1, "heading": 112.0, "risk": "LOW", "score": 19.5},
    {"mmsi": 0, "name": "UNIDENTIFIED CONTACT", "flag": "UN", "type": "Dark Vessel (AIS Off)", "lat": 28.60100, "lon": -94.95200, "speed_knots": 9.4, "heading": 89.0, "risk": "HIGH", "score": 88.5, "is_dark_vessel": True}
]


def generate_live_telemetry_event():
    """Generates real-time live telemetry payload with updated vessel movements and spill drift."""
    timestamp = datetime.now(timezone.utc).isoformat()
    updated_vessels = []
    
    for v in LIVE_VESSELS:
        # Micro-drift simulation: update position based on speed and heading
        speed = v["speed_knots"] + random.uniform(-0.3, 0.3)
        v["speed_knots"] = round(max(speed, 0.5), 1)
        
        # heading delta
        v["heading"] = round((v["heading"] + random.uniform(-1.5, 1.5)) % 360, 1)
        
        # position delta in degrees (approx 1 knot ~ 0.0005 deg/min)
        heading_rad = np_heading = (90 - v["heading"]) * 3.14159 / 180.0
        v["lat"] = round(v["lat"] + (v["speed_knots"] * 0.00003 * 0.5 * (1 + random.uniform(-0.1, 0.1))), 6)
        v["lon"] = round(v["lon"] + (v["speed_knots"] * 0.00003 * 0.5 * (1 + random.uniform(-0.1, 0.1))), 6)
        
        # score minor fluctuation
        v["score"] = round(min(max(v["score"] + random.uniform(-0.4, 0.4), 5.0), 99.5), 1)

        updated_vessels.append(dict(v))

    return {
        "event_type": "AIS_TICK",
        "timestamp": timestamp,
        "active_vessels_count": len(updated_vessels),
        "dark_vessels_count": sum(1 for x in updated_vessels if x.get("is_dark_vessel")),
        "spill_drift_rate_knots": round(0.85 + random.uniform(-0.05, 0.05), 2),
        "ocean_current_speed_ms": round(0.42 + random.uniform(-0.02, 0.02), 2),
        "wind_speed_knots": round(12.4 + random.uniform(-0.6, 0.6), 1),
        "vessels": updated_vessels
    }


@router.get("/stream")
async def sse_vessel_stream():
    """
    Server-Sent Events (SSE) live stream endpoint for real-time AIS,
    vessel attribution scores, and telemetry updates (every 2.5 seconds).
    """
    async def event_generator():
        while True:
            data = generate_live_telemetry_event()
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(2.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.websocket("/ws")
async def websocket_vessel_stream(websocket: WebSocket):
    """
    WebSocket endpoint for bidirectional real-time vessel streaming,
    live polluter attribution alerts, and interactive viewport queries.
    """
    await websocket.accept()
    try:
        while True:
            data = generate_live_telemetry_event()
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(2.5)
    except WebSocketDisconnect:
        pass


@router.get("/{mmsi}/trajectory")
def trajectory(mmsi: int):
    match = next((v for v in LIVE_VESSELS if v["mmsi"] == mmsi), None)
    return {
        "mmsi": mmsi,
        "vessel": match,
        "status": "ready"
    }

