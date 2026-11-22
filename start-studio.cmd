@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel% EQU 0 (
    start "KittyLotus Studio server" cmd /k "py -m http.server 4173"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:4173/"
    exit /b
)
where python >nul 2>&1
if %errorlevel% EQU 0 (
    start "KittyLotus Studio server" cmd /k "python -m http.server 4173"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:4173/"
    exit /b
)
echo Python 3 is needed for the one-command local server.
echo Open a terminal here and run: py -m http.server 4173
echo Then visit http://localhost:4173/
pause
