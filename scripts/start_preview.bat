@echo off
setlocal

cd /d "%~dp0.."
if errorlevel 1 (
  echo Could not open the Halonyx-Web project folder.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is required. Reinstall Node.js with npm enabled, then run this file again.
  pause
  exit /b 1
)

echo Building the Halonyx landing page...
call npm run build:landing
if errorlevel 1 (
  echo The landing page build failed.
  pause
  exit /b 1
)

echo.
echo Starting the local preview at http://localhost:4173
echo Keep this window open while using the site. Press Ctrl+C to stop it.
echo.
call npm run preview
if errorlevel 1 (
  echo The preview server could not start. Check whether port 4173 is already in use.
  pause
  exit /b 1
)

endlocal
