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

:: Show clean URLs (Local and Mobile Wi-Fi) without QR clutter
call node scripts\show-link.mjs

echo Opening local browser in 3 seconds...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo Next.js Server Logs (Phone & PC Active):
echo -------------------------------------------------------------
call npm run dev

pause
