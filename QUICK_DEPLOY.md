# Quick Deploy Guide - EC2

## 🚀 Fast Track (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. On EC2 Instance

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Clone repository
cd ~
git clone https://github.com/YOUR_USERNAME/collaborative-editor.git
cd collaborative-editor

# Run deployment
chmod +x ec2-deploy.sh
./ec2-deploy.sh

# Configure environment
nano server/.env
# Add: JWT_SECRET, GEMINI_API_KEY, MONGODB_URI

# Restart
pm2 restart collaborative-editor-server
```

### 3. Access
Open browser: `http://YOUR_EC2_IP`

---

## 📝 Environment Variables Template

Create `server/.env`:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
JWT_SECRET=your-random-secret-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key-here
CLIENT_URL=http://YOUR_EC2_IP
```

---

## 🔄 Update Code Later

```bash
cd ~/collaborative-editor
git pull
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

---

## ✅ Verify Deployment

```bash
# Check services
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod

# Check logs
pm2 logs collaborative-editor-server
```

---

## 🆘 Common Issues

**Port 80 not accessible?**
- Check EC2 Security Group → Allow HTTP (port 80) from 0.0.0.0/0

**Server not starting?**
- Check `server/.env` exists and has correct values
- Check MongoDB: `sudo systemctl status mongod`

**Nginx error?**
- Test config: `sudo nginx -t`
- Check logs: `sudo tail -f /var/log/nginx/error.log`

