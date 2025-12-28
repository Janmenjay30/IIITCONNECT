@echo off
setlocal

rem Run from repo root regardless of current working directory
cd /d "%~dp0.."

echo Starting IIITConnect backend + frontend...
echo.

start "IIITConnect Backend" cmd /k "cd backend && npm run dev"
start "IIITConnect Frontend" cmd /k "cd frontend && npm run dev"

echo Started both processes in separate terminals.
endlocal
