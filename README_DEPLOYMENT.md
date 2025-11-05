# 🚀 Quick Deployment Reference

## 🎯 Recommended: Render (Free)

**Best for this app** - Supports WebSockets!

### ⚡ 5-Minute Setup

1. **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas (free tier)
2. **Push to GitHub**: `git push origin main`
3. **Deploy Backend on Render**:
   - New Web Service
   - Build: `cd server && npm install`
   - Start: `cd server && npm start`
   - Set env vars (see below)
4. **Deploy Frontend on Render**:
   - New Static Site
   - Build: `cd client && npm install && npm run build`
   - Publish: `client/build`
   - Set: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

### 📝 Environment Variables

**Backend (Render)**:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-key
CLIENT_URL=https://your-frontend.onrender.com
```

**Frontend (Render)**:
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 📚 Full Guides

- **Complete Guide**: [DEPLOY_VERCEL_RENDER.md](./DEPLOY_VERCEL_RENDER.md)
- **Quick Start**: [QUICK_DEPLOY_RENDER.md](./QUICK_DEPLOY_RENDER.md)
- **Overview**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🆘 Need Help?

1. Check service logs in dashboard
2. Verify environment variables
3. Test API: `https://your-backend.onrender.com/api/health`
4. Check MongoDB connection

**Happy Deploying! 🎉**

