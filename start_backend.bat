@echo off
echo Starting Z-Image Backend Service...
call conda activate zimage
python -m uvicorn backend.main:app --host 0.0.0.0 --port 15000