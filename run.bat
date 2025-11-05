@echo off
echo ========================================
echo Collaborative Text Editor - Quick Run
echo ========================================
echo.

REM Check if .env files exist
if not exist "server\.env" (
    echo Creating server\.env from template...
    copy server\env.example server\.env
    echo.
    echo [IMPORTANT] Please edit server\.env and add your Gemini API key!
    echo.
    pause
)

if not exist "client\.env" (
    echo Creating client\.env...
    echo REACT_APP_API_URL=http://localhost:5000/api > client\.env
    echo REACT_APP_SOCKET_URL=http://localhost:5000 >> client\.env
)

echo Checking Node.js...
node -v
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo ========================================
echo Starting Application...
echo ========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Make sure MongoDB is running!
echo (If using Docker: docker run -d -p 27017:27017 --name mongodb mongo:7)
echo.
pause

npm run dev

