from fastapi import APIRouter

router = APIRouter()

@router.get("/{mmsi}/trajectory")
def trajectory(mmsi: int):
    return {"mmsi": mmsi, "trajectory": [], "status": "ready"}
