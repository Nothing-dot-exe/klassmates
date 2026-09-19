@echo off
title Classmate - Private Classroom Workspace
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Show clean URLs (Local and Mobile Wi-Fi)
call node scripts\show-link.mjs

echo Launch Mode:
echo   [1] Standard Mode (Local PC + Home Wi-Fi)
echo   [2] Mobile Hotspot Tunnel Mode (For Realme/Phone Hotspot)
echo.

choice /C 12 /T 4 /D 1 /M "Select [1] Standard or [2] Mobile Tunnel (Auto-starting 1 in 4s)"

if errorlevel 2 (
    echo.
    echo Starting Mobile Hotspot Tunnel in a separate window...
    start "Classmate Mobile Tunnel" cmd /c "echo Connecting mobile tunnel... & echo. & npx -y localtunnel --port 3000 & pause"
)

echo.
echo Opening local browser in 3 seconds...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo Next.js Server Logs (Phone & PC Active):
echo -------------------------------------------------------------
call npm run dev

pause
