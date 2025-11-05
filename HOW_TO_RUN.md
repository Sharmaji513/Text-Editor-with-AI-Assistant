# How to Run the Project

## Quick Start (5 Steps)

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Setup Environment Variables

**Create `server/.env` file:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
JWT_SECRET=your-secret-key-change-this
GEMINI_API_KEY=your-gemini-api-key-here
CLIENT_URL=http://localhost:3000
```

**Create `client/.env` file:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 3: Start MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Option B: If MongoDB is already installed**
```bash
# Windows - Start MongoDB service from Services
# Or run: net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Step 4: Run the Application
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:3000

### Step 5: Open in Browser
Navigate to: **http://localhost:3000**

---

## Detailed Steps

### Prerequisites Check

1. **Node.js 18+**
   ```bash
   node -v  # Should show v18 or higher
   ```

2. **MongoDB**
   - Local MongoDB installation OR
   - MongoDB Atlas account OR
   - Docker (for running MongoDB in container)

3. **Google Gemini API Key**
   - Get free API key: https://makersuite.google.com/app/apikey

### Installation

1. **Install all dependencies:**
   ```bash
   # From project root
   npm run install-all
   
   # Or manually:
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

### Configuration

1. **Backend Environment (`server/.env`):**
   ```bash
   cd server
   # Copy example file
   copy env.example .env   # Windows
   # OR
   cp env.example .env    # Mac/Linux
   
   # Edit .env and add:
   # - Your MongoDB URI (or keep default for local)
   # - Your Gemini API key
   # - Change JWT_SECRET to something secure
   ```

2. **Frontend Environment (`client/.env`):**
   ```bash
   cd client
   # Create .env file with:
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

**Option 1: Run Both Together (Recommended)**
```bash
npm run dev
```

**Option 2: Run Separately (Two Terminals)**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## Running with Docker (Alternative)

If you prefer to run everything in Docker:

```bash
# Make sure to set environment variables first
# Then run:
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## First Time Setup

1. **Register a new account:**
   - Go to http://localhost:3000
   - Click "Register" tab
   - Enter username, email, password
   - Click "Register"

2. **Create your first document:**
   - Click "New Document"
   - Enter a title
   - Start editing!

3. **Test real-time collaboration:**
   - Open document in another browser/incognito
   - Login with different account
   - Edit simultaneously - see changes in real-time!

4. **Test AI features:**
   - Click the AI icon (brain) in editor
   - Try grammar check, enhance, summarize, etc.

---

## Troubleshooting

### Port Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error
- Check if MongoDB is running: `docker ps` (if using Docker)
- Verify MONGODB_URI in `server/.env`
- Try: `mongosh` or `mongo` to test connection

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules server/node_modules client/node_modules
npm run install-all
```

### Gemini API Errors
- Verify API key is correct in `server/.env`
- Check API quota/limits
- Ensure internet connection

### CORS/Socket.io Errors
- Verify CLIENT_URL in `server/.env` matches frontend URL
- Check browser console for errors
- Ensure both server and client are running

---

## Development vs Production

### Development (Current Setup)
- Hot reload enabled
- Detailed error messages
- Runs on ports 3000 (frontend) and 5000 (backend)

### Production
- Build frontend: `cd client && npm run build`
- Run server only: `cd server && npm start`
- Or use Docker: `docker-compose up -d`

---

## Need Help?

- Check `QUICKSTART.md` for quick setup
- Check `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for AWS deployment
- Check server logs: `cd server && npm run dev`
- Check browser console (F12) for frontend errors

---

**Happy Coding! 🚀**

