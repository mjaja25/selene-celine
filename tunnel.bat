@echo off
setlocal
cd /d "%~dp0"
title SELENE - cloudflare tunnel

set "PORT=8765"
set "LOG=%TEMP%\selene-tunnel.log"
set "URLFILE=%TEMP%\selene-tunnel-url.txt"
set "LOCAL=http://localhost:%PORT%/"

echo.
echo   SELENE - cloudflare tunnel
echo.

rem --- 1. make sure the local site is running ---
netstat -an | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto server_ok
echo   Local server is not running - starting serve.bat ...
start "" "%~dp0serve.bat"
set /a _n=0
:wait_server
timeout /t 1 /nobreak >nul
netstat -an | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto server_ok
set /a _n+=1
if %_n% lss 20 goto wait_server
echo.
echo   ERROR: the local server did not start on port %PORT%.
echo   Run serve.bat on its own and check the message in that window.
echo.
pause
exit /b 1
:server_ok
echo   Local site      : %LOCAL%

rem --- 2. find or fetch cloudflared ---
set "CF=%~dp0cloudflared.exe"
if exist "%CF%" goto have_cf
where cloudflared >nul 2>nul
if not errorlevel 1 (
  set "CF=cloudflared"
  goto have_cf
)
echo   Downloading cloudflared (one time, ~55 MB) ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%~dp0cloudflared.exe'"
if exist "%CF%" goto have_cf
echo.
echo   ERROR: could not download cloudflared.
echo   Download it manually from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
echo   and save it as cloudflared.exe next to this file.
echo.
pause
exit /b 1
:have_cf

rem --- 3. start the tunnel ---
del "%LOG%" >nul 2>&1
del "%URLFILE%" >nul 2>&1
echo   Opening tunnel ...
start "cloudflared" /b cmd /c ""%CF%" tunnel --url %LOCAL% >"%LOG%" 2>&1"

rem --- 4. wait for the public url ---
echo   Waiting for the url ...
set "URL="
set /a _n=0
:poll
timeout /t 1 /nobreak >nul
set "URL="
for /f "tokens=2 delims=|" %%A in ('findstr /i "trycloudflare" "%LOG%" 2^>nul') do set "URL=%%A"
if not defined URL goto next_poll
set "URL=%URL: =%"
if not "%URL:~0,8%"=="https://" goto next_poll
goto got_url
:next_poll
set /a _n+=1
if %_n% lss 60 goto poll
echo.
echo   ERROR: the tunnel did not return a url. Log tail:
echo.
type "%LOG%"
echo.
pause
exit /b 1

:got_url
echo %URL%>"%URLFILE%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Clipboard -Value '%URL%'" >nul 2>&1
echo.
echo   Your public url is live:
echo.
echo      %URL%
echo.
echo   (also copied to the clipboard - the file %URLFILE% keeps it)
echo   This url changes every time you restart the tunnel.
echo   A brand new link can take up to a minute before it first opens.
echo.
echo   Keep this window open. Close it to stop the tunnel.
echo.

rem --- 5. stay alive while cloudflared runs ---
:watch
timeout /t 15 /nobreak >nul
tasklist /fi "imagename eq cloudflared.exe" 2>nul | find /i "cloudflared.exe" >nul
if errorlevel 1 goto tunnel_died
goto watch

:tunnel_died
echo.
echo   The tunnel stopped. Last log lines:
echo.
type "%LOG%"
echo.
pause
exit /b 1
