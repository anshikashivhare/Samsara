from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/detect")
async def detect(file: UploadFile = File(...)):
    return {"filename": file.filename, "status": "queued", "message": "Connect ml.inference.predict for model inference."}
