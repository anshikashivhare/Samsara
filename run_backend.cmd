@echo off
cd /d "C:\Users\Anuj Rampuriya\Desktop\Samsara"
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
