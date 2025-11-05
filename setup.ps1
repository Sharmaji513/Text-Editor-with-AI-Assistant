# PowerShell setup script for Windows

Write-Host "🚀 Setting up Collaborative Text Editor..." -ForegroundColor Green

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

$nodeVersion = (node -v).Substring(1).Split('.')[0]
if ([int]$nodeVersion -lt 18) {
    Write-Host "❌ Node.js version 18+ is required. Current version: $(node -v)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js $(node -v) found" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
Set-Location ..

Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
Set-Location ..

# Check if .env files exist
if (-not (Test-Path "server\.env")) {
    Write-Host "📝 Creating server\.env from template..." -ForegroundColor Yellow
    Copy-Item "server\env.example" "server\.env"
    Write-Host "⚠️  Please edit server\.env and add your configuration!" -ForegroundColor Yellow
}

if (-not (Test-Path "client\.env")) {
    Write-Host "📝 Creating client\.env..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
"@ | Out-File -FilePath "client\.env" -Encoding utf8
}

# Check MongoDB
Write-Host "🔍 Checking MongoDB..." -ForegroundColor Yellow
if (Get-Command mongosh -ErrorAction SilentlyContinue) {
    Write-Host "✅ MongoDB CLI found" -ForegroundColor Green
} elseif (Get-Command mongo -ErrorAction SilentlyContinue) {
    Write-Host "✅ MongoDB CLI found" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB CLI not found. Make sure MongoDB is installed and running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit server\.env with your MongoDB URI and Gemini API key"
Write-Host "2. Start MongoDB (if using local)"
Write-Host "3. Run: npm run dev"
Write-Host ""
Write-Host "📚 See QUICKSTART.md for detailed instructions" -ForegroundColor Cyan

