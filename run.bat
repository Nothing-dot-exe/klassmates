@echo off
title iClassmates - Student Workspace ^& Academic Hub
cd /d "%~dp0"

cls
echo =============================================================
echo        iCLASSMATES - STUDENT ACADEMIC WORKSPACE
echo    Closed-Network Cohort Hub ^& Campus Note Vault
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

:: 4. Detect Launch Mode (%1 argument or default to 1)
set MODE=1
if /i "%~1"=="tunnel" set MODE=2
if /i "%~1"=="2" set MODE=2
if /i "%~1"=="ideathon" set MODE=3
if /i "%~1"=="3" set MODE=3

if "%MODE%"=="2" (
    echo [MODE] Starting Mobile Tunnel in a separate window...
    start "iClassmates Mobile Tunnel" cmd /c "echo Connecting mobile tunnel... & echo. & npx -y localtunnel --port 3000 & pause"
)

if "%MODE%"=="3" (
    echo [MODE] Opening Ideathon Presentation PDF...
    if exist "BKIT_Ideathon_Submission\BKIT_Classmate_Ideathon_Presentation.pdf" (
        start "" "BKIT_Ideathon_Submission\BKIT_Classmate_Ideathon_Presentation.pdf"
    ) else if exist "BKIT_Classmate_Ideathon_Presentation.pdf" (
        start "" "BKIT_Classmate_Ideathon_Presentation.pdf"
    )
)

echo Starting background browser watcher...
start "" /B node scripts\open-browser-when-ready.mjs

echo =============================================================
echo  Next.js Server Active (Turbopack)
echo  Browser will open automatically once server is ready.
echo  [Notice] QR Code ^& Invite Links are live in the website UI
echo  Press Ctrl+C to stop the server
echo =============================================================
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Next.js server stopped with error code %errorlevel%.
    echo If port 3000 is occupied, try closing existing node windows and retry.
)

pause

