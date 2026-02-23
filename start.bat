@echo off
REM ========================================
REM   Z-Image Startup Script
REM ========================================
REM.

REM Check if conda environment exists
echo Checking conda environment...
conda env list | findstr /C:"zimage" >nul
if %errorlevel% neq 0 (
    echo Error: conda environment 'zimage' does not exist
    echo Please run: conda create -n zimage python=3.10
    pause
    exit /b 1
)

echo Activating conda environment...
call conda activate zimage

echo.
echo ========================================
echo   Starting Backend Service (FastAPI)
echo ========================================
echo Backend will run on http://localhost:15000
echo API Docs: http://localhost:15000/docs
echo.
echo Press Ctrl+C to stop backend service
echo ========================================
echo.

start "Z-Image Backend" cmd /k "conda activate zimage && cd /d %~dp0 && python -m uvicorn backend.main:app --host 0.0.0.0 --port 15000"

echo Waiting for backend service to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Starting Frontend Service (React + Vite)
echo ========================================
echo Frontend will run on http://localhost:15001
echo.
echo Press Ctrl+C to stop frontend service
echo ========================================
echo.

start "Z-Image Frontend" cmd /k "conda activate zimage && cd /d %~dp0frontend && npm run dev -- --port 15001"

echo.
echo ========================================
echo   Services Started!
echo ========================================
echo.
echo Access App: http://localhost:15001
echo Backend API: http://localhost:15000/docs
echo.
echo Press any key to close this window (services will continue running)
pause >nul