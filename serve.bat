@echo off
setlocal
cd /d "%~dp0"
title SELENE - http://localhost:8765/

rem --- pick a Python (known install, then launcher, then PATH) ---
if exist "%LocalAppData%\Programs\Python\Python311\python.exe" set "PY=%LocalAppData%\Programs\Python\Python311\python.exe"
if not defined PY (
  where py >nul 2>nul
  if not errorlevel 1 set "PY=py -3"
)
if not defined PY (
  where python >nul 2>nul
  if not errorlevel 1 set "PY=python"
)
if not defined PY goto nopython
%PY% --version >nul 2>nul
if errorlevel 1 goto nopython

rem --- show the addresses ---
set "IP="
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4"') do set "IP=%%A"
set "IP=%IP: =%"

echo.
echo   SELENE is live:
echo.
echo     Local    http://localhost:8765/
if defined IP echo     Network  http://%IP%:8765/
echo.
echo   Close this window to stop the server.
echo.

%PY% -m http.server 8765 --bind 0.0.0.0
echo.
echo   Server stopped.
pause
exit /b 0

:nopython
echo.
echo   Python was not found.
echo   Install Python 3 and tick "Add python.exe to PATH" during setup.
echo.
pause
exit /b 1
