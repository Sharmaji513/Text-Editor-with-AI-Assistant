# Quick Start Guide

Get the Collaborative Text Editor running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Installation Steps

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Setup Environment Variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
JWT_SECRET=your-secret-key-change-this
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:3000
```

Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Start MongoDB

**Option A: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Option B: Local Installation**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services
```

### 4. Run the Application

```bash
npm run dev
```

This starts both the backend server (port 5000) and frontend client (port 3000).

### 5. Open in Browser

Navigate to: http://localhost:3000

### 6. Create Account

1. Click "Register" tab
2. Enter username, email, and password
3. Click "Register"
4. You'll be redirected to the dashboard

### 7. Create Your First Document

1. Click "New Document"
2. Enter a title
3. Start editing!

## Testing Features

### Real-time Collaboration
1. Open the document in two different browser windows (or incognito)
2. Login with different accounts
3. Edit simultaneously - see changes in real-time!

### AI Assistant
1. Click the AI icon (brain) in the editor
2. Select text or use full document
3. Try different AI features:
   - Grammar Check
   - Enhance Text
   - Summarize
   - Get Suggestions

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running: `mongosh` or `mongo`
- Check MONGODB_URI in `.env` file
- For Docker: `docker ps` to verify MongoDB container is running

### Port Already in Use
- Change PORT in `server/.env`
- Or kill the process using the port:
  ```bash
  # Find process
  lsof -i :5000
  # Kill process
  kill -9 <PID>
  ```

### Gemini API Errors
- Verify API key is correct
- Check API quota limits
- Ensure internet connection

### Socket.io Connection Issues
- Check CLIENT_URL matches frontend URL
- Verify CORS settings
- Check browser console for errors

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for AWS EC2 deployment
- Explore the codebase to understand the architecture

## Need Help?

- Check the main README.md for detailed troubleshooting
- Review DEPLOYMENT.md for deployment-specific issues
- Check server logs: `cd server && npm run dev`
- Check browser console for frontend errors

Happy coding! 🚀

