@echo off
echo [AG2 Start] Starte Pipeline Builder...
echo.

start "AG2 Backend" cmd /k "call venv\Scripts\activate.bat && cd backend && uvicorn main:app --reload --port 8000"
start "AG2 Frontend" cmd /k "cd frontend && npm run dev"

echo Prozesse gestartet. Schliesse dieses Fenster, um die Konsolen offen zu halten.