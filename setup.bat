@echo off
echo [AG2 Setup] Starte Initialisierung...
echo.

if exist venv (
    echo [1/5] Loesche alten venv Ordner...
    rmdir /s /q venv
)

echo [2/5] Suche nach stabiler Python-Version (3.12 oder 3.11)...

py -3.12 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python 3.12 gefunden! Erstelle Umgebung...
    py -3.12 -m venv venv
    goto continue_setup
)

py -3.11 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python 3.11 gefunden! Erstelle Umgebung...
    py -3.11 -m venv venv
    goto continue_setup
)

echo.
echo [FEHLER] Weder Python 3.12 noch 3.11 gefunden!
echo Bitte lade dir Python 3.12 von python.org herunter und installiere es.
pause
exit /b

:continue_setup
echo [3/5] Aktiviere venv und installiere Backend-Anforderungen...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

echo [4/5] Installiere Playwright Chromium-Browser...
playwright install chromium

echo [5/5] Pruefe Frontend...
if not exist frontend\package.json (
    echo Erstelle neues Vite-Projekt...
    call npm create vite@latest frontend -- --template react-ts
    cd frontend
    call npm install
    call npm install @xyflow/react axios react-router-dom lucide-react
    cd ..
) else (
    echo Frontend existiert bereits! Installiere nur Updates...
    cd frontend
    call npm install
    call npm install @xyflow/react axios react-router-dom lucide-react
    cd ..
)

echo.
echo [AG2 Setup] Abgeschlossen! Du kannst nun start.bat ausfuehren.
pause