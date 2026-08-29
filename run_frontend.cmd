@echo off
cd /d "%~dp0frontend"
set VITE_API_URL=http://127.0.0.1:8000/api/v1
call npm run dev
