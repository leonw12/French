@echo off
rem Starts the Francais ATAR app and opens it in your browser. Your data is saved in the "userdata" folder next to this file.
cd /d "%~dp0"
start "" "http://localhost:5174/"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
