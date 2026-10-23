@echo off
:: ============================================================================
:: OMEGA MASTER ORCHESTRATOR - WINDOWS DESKTOP RUNTIME LAUNCHER
:: Version: 3.0.0
:: Launches OMEGA in a clean, standalone desktop window (No address bar, no tabs)
:: ============================================================================
title OMEGA Master Orchestrator - Desktop Launcher
color 0b

echo.
echo  ==============================================================
echo    OMEGA MASTER ORCHESTRATOR - WINDOWS DESKTOP APP
echo  ==============================================================
echo.
echo  [SYSTEM] Checking installed browser engines on Windows...

set "TARGET_URL=https://ais-dev-nr6p3xkvtusnaosqhzh73l-290704346206.europe-west2.run.app"
set "APP_DATA_DIR=%LOCALAPPDATA%\OMEGA_Desktop_App"

if not exist "%APP_DATA_DIR%" mkdir "%APP_DATA_DIR%"

:: 1. Check for Microsoft Edge (Standard on Windows 10/11)
set "EDGE_EXE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE_EXE=%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"
)

:: 2. Check for Google Chrome fallback
set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

:: 3. Launch in standalone window mode
if defined EDGE_EXE (
    echo  [OK] Microsoft Edge detected.
    echo  [LAUNCH] Launching OMEGA in standalone desktop window...
    start "" "%EDGE_EXE%" --app="%TARGET_URL%" --window-size=1440,920 --user-data-dir="%APP_DATA_DIR%"
    goto :Done
)

if defined CHROME_EXE (
    echo  [OK] Google Chrome detected.
    echo  [LAUNCH] Launching OMEGA in standalone desktop window...
    start "" "%CHROME_EXE%" --app="%TARGET_URL%" --window-size=1440,920 --user-data-dir="%APP_DATA_DIR%"
    goto :Done
)

:: 4. Fallback: default web browser
echo  [WARN] Standalone Chromium runner not found at standard path.
echo  [INFO] Opening target URL in default browser...
start "" "%TARGET_URL%"

:Done
echo.
echo  [READY] OMEGA Desktop App session started successfully!
timeout /t 3 >nul
exit /b 0
