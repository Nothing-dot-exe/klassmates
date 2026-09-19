@echo off
title Classmate Web App
cd /d "%~dp0"

echo ===================================================
echo           Starting Classmate Web App
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

set "LOCAL_IP="
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-NetIPConfiguration | Where-Object IPv4DefaultGateway -ne $null | Select-Object -ExpandProperty IPv4Address | Select-Object -First 1 -ExpandProperty IPAddress)"`) do set "LOCAL_IP=%%a"
if "%LOCAL_IP%"=="" set "LOCAL_IP=localhost"

echo Starting server...
echo.
echo  - Local URL:   http://localhost:3000
echo  - Network URL: http://%LOCAL_IP%:3000
echo.
echo Opening browser in 3 seconds...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo.
echo ===================================================
echo Next.js server logs:
echo ===================================================
call npm run dev

pause
