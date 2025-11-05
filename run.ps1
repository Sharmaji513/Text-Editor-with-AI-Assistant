Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Collaborative Text Editor - Quick Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist
if (-not (Test-Path "server\.env")) {
    Write-Host "Creating server\.env from template..." -ForegroundColor Yellow
    Copy-Item "server\env.example" "server\.env"
    Write-Host ""
    Write-Host "[IMPORTANT] Please edit server\.env and add your Gemini API key!" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to continue"
}

if (-not (Test-Path "client\.env")) {
    Write-Host "Creating client\.env..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
"@ | Out-File -FilePath "client\.env" -Encoding utf8
}

Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking if dependencies are installed..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "server\node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Application..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Make sure MongoDB is running!" -ForegroundColor Yellow
Write-Host "(If using Docker: docker run -d -p 27017:27017 --name mongodb mongo:7)" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to start"

npm run dev

