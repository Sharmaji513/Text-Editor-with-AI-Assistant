# Multi-stage build for production
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm install --production

COPY server/ ./

# Create public directory and copy React build
RUN mkdir -p public
COPY --from=builder /app/client/build ./public

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]

