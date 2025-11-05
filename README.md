# Collaborative Text Editor with AI Assistant

A real-time collaborative text editor similar to Google Docs, featuring multi-user editing, document management, and AI-powered writing assistance using Google Gemini.

## 🚀 Features

- **Real-time Collaborative Editing**: Multiple users can edit documents simultaneously with live synchronization
- **Document Management**: Create, save, share, and manage documents with proper permissions
- **AI Writing Assistant**: 
  - Grammar and style checking
  - Text enhancement
  - Content summarization
  - Smart auto-completion
  - Writing suggestions
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Auto-save**: Automatic document saving every 30 seconds
- **User Presence**: See who's currently editing the document
- **Share Links**: Generate secure share links for document collaboration

## 🛠 Tech Stack

### Frontend
- React.js 18
- React Router for navigation
- Quill.js for rich text editing
- Material-UI for UI components
- Socket.io-client for real-time communication
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB for data persistence
- Socket.io for real-time collaboration
- JWT for authentication
- Google Gemini API for AI features
- Bcrypt for password hashing

### Deployment
- Docker for containerization
- AWS EC2 for cloud hosting

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Docker (for deployment)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Editor
```

### 2. Install dependencies

```bash
npm run install-all
```

Or install separately:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
JWT_SECRET=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key-here
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the `client` directory:

```bash
cd ../client
```

Create `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or use your local MongoDB installation
mongod
```

### 5. Run the application

#### Development mode (runs both server and client):

```bash
npm run dev
```

#### Or run separately:

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend client
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🐳 Docker Deployment

### Build and run with Docker Compose:

```bash
docker-compose up -d
```

### Build Docker image:

```bash
docker build -t collaborative-editor .
```

### Run Docker container:

```bash
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongodb:27017/collaborative-editor \
  -e JWT_SECRET=your-secret-key \
  -e GEMINI_API_KEY=your-api-key \
  -e CLIENT_URL=http://localhost:3000 \
  collaborative-editor
```

## ☁️ AWS EC2 Deployment

### 1. Launch EC2 Instance

1. Launch an EC2 instance (Ubuntu 22.04 LTS recommended)
2. Configure security groups:
   - SSH (22) - from your IP only
   - HTTP (80) - from anywhere
   - HTTPS (443) - from anywhere
   - Custom TCP (5000) - from anywhere (or restrict to your IP)

### 2. Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 3. Install Docker and Docker Compose

```bash
# Update system
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker ubuntu
```

### 4. Clone and Setup Application

```bash
# Clone repository
git clone <repository-url>
cd Editor

# Create .env file
nano server/.env
# Add your environment variables

# Create docker-compose.yml with production settings
```

### 5. Build and Run

```bash
# Build and start containers
docker-compose up -d --build

# Check logs
docker-compose logs -f

# View running containers
docker ps
```

### 6. Configure Nginx (Optional - for SSL)

```bash
# Install Nginx
sudo apt-get install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/collaborative-editor
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/collaborative-editor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

## 🔐 Security Features

- JWT-based authentication with secure HTTP-only cookies
- Input sanitization to prevent XSS attacks
- Rate limiting on all API endpoints
- Password hashing with bcrypt
- Secure WebSocket connections
- Environment variable management
- Helmet.js for security headers
- CORS configuration

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Documents
- `GET /api/documents` - Get user's documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Generate share link
- `GET /api/documents/share/:shareLink` - Get document by share link

### AI Assistant
- `POST /api/ai/grammar-check` - Check grammar and style
- `POST /api/ai/enhance` - Enhance writing quality
- `POST /api/ai/summarize` - Summarize text
- `POST /api/ai/complete` - Auto-complete text
- `POST /api/ai/suggestions` - Get writing suggestions

## 🔌 WebSocket Events

### Client → Server
- `join-document` - Join document editing session
- `leave-document` - Leave document session
- `text-change` - Send text modifications
- `cursor-move` - Update cursor position

### Server → Client
- `document-state` - Current document state
- `text-change` - Text change from another user
- `user-joined` - User joined notification
- `user-left` - User left notification
- `active-users` - List of active users
- `document-saved` - Auto-save confirmation
- `error` - Error messages

## 🧪 Testing

```bash
# Run tests (if implemented)
cd server
npm test

# Run client tests
cd ../client
npm test
```

## 📝 Project Structure

```
collaborative-text-editor/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Editor.js
│   │   │   ├── AIAssistant.js
│   │   │   └── ActiveUsers.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/
│   ├── config/
│   │   ├── database.js
│   │   └── gemini.js
│   ├── models/
│   │   ├── User.js
│   │   └── Document.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── documents.js
│   │   └── ai.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── services/
│   │   └── geminiService.js
│   ├── websockets/
│   │   └── socketHandler.js
│   ├── utils/
│   │   └── sanitize.js
│   ├── index.js
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### Socket.io Connection Issues
- Check CORS configuration
- Verify CLIENT_URL matches frontend URL
- Check firewall settings

### Gemini API Issues
- Verify GEMINI_API_KEY is set correctly
- Check API quota limits
- Ensure API key has proper permissions

### Port Conflicts
- Change PORT in .env file
- Ensure no other application is using the port

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Google Gemini API](https://ai.google.dev/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

## 👨‍💻 Author

Created as part of SDE Intern technical assignment for WorkRadius AI Technologies Pvt Ltd.

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Note**: This is a learning project. Some features may need refinement for production use.

