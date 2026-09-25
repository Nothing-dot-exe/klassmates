@echo off
title Classmate - Private Classroom Workspace
cd /d "%~dp0"

cls
echo =============================================================
echo        CLASSMATE - PRIVATE CLASSROOM WORKSPACE
echo   Closed-Network Cohort Hub & Campus Note Vault
echo =============================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check Dependencies
if not exist "node_modules\" (
    echo [SETUP] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
    echo.
)

:: 3. Show Active Network Links
if exist "scripts\show-link.mjs" (
    call node scripts\show-link.mjs
)

:: 4. Select Launch Mode
echo Launch Modes:
echo   [1] Standard Mode   - Local PC (http://localhost:3000) + Phone on same Wi-Fi
echo   [2] Mobile Tunnel   - Public tunnel URL for remote phones or mobile hotspots
echo   [3] Ideathon Mode   - Starts App + Opens Ideathon Presentation PDF for Judges
echo.

choice /C 123 /T 5 /D 1 /M "Select [1, 2, or 3] (Auto-starting Mode 1 in 5s)"
set MODE=%errorlevel%

if "%MODE%"=="2" (
    echo.
    echo Starting Mobile Tunnel in a separate window...
    start "Classmate Mobile Tunnel" cmd /c "echo Connecting mobile tunnel... & echo. & npx -y localtunnel --port 3000 & pause"
)

if "%MODE%"=="3" (
    echo.
    echo Opening Ideathon Presentation PDF...
    if exist "BKIT_Ideathon_Submission\BKIT_Classmate_Ideathon_Presentation.pdf" (
        start "" "BKIT_Ideathon_Submission\BKIT_Classmate_Ideathon_Presentation.pdf"
    ) else if exist "BKIT_Classmate_Ideathon_Presentation.pdf" (
        start "" "BKIT_Classmate_Ideathon_Presentation.pdf"
    )
)

echo.
echo Launching local browser in 3 seconds...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo.
echo =============================================================
echo  Next.js Server Active (Turbopack)
echo  [Notice] QR Code & Invite Links are live in the website UI
echo  Press Ctrl+C to stop the server
echo =============================================================
echo.

call npm run dev

pause
