@echo off
echo Starting Z-Image Frontend Service...
call conda activate zimage
cd frontend
npm run dev -- --port 15001