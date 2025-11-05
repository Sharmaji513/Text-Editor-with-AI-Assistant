#!/bin/bash

echo "🚀 Setting up Collaborative Text Editor..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env from template..."
    cp server/env.example server/.env
    echo "⚠️  Please edit server/.env and add your configuration!"
fi

if [ ! -f "client/.env" ]; then
    echo "📝 Creating client/.env..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env
    echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> client/.env
fi

# Check MongoDB
echo "🔍 Checking MongoDB..."
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo "✅ MongoDB CLI found"
else
    echo "⚠️  MongoDB CLI not found. Make sure MongoDB is installed and running."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit server/.env with your MongoDB URI and Gemini API key"
echo "2. Start MongoDB (if using local): docker run -d -p 27017:27017 --name mongodb mongo:7"
echo "3. Run: npm run dev"
echo ""
echo "📚 See QUICKSTART.md for detailed instructions"

