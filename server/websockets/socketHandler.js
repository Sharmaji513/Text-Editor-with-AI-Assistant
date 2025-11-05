const Document = require('../models/Document');

const activeUsers = new Map(); // documentId -> Map of userId -> {username, socketIds}
const documentRooms = new Map(); // documentId -> Set of socketIds
const saveTimers = new Map(); // documentId -> timeout

const handleSocketConnection = (socket, io) => {
  console.log(`User connected: ${socket.user.username} (${socket.id})`);

  // Join document
  socket.on('join-document', async ({ documentId }) => {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        socket.emit('error', { message: 'Document not found' });
        return;
      }

      // Check permissions
      const hasAccess = document.owner.toString() === socket.user._id.toString() ||
        document.permissions.some(p => p.user.toString() === socket.user._id.toString());

      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      socket.join(documentId);

      // Track active users
      if (!activeUsers.has(documentId)) {
        activeUsers.set(documentId, new Map());
      }
      const userMap = activeUsers.get(documentId);
      const userId = socket.user._id.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, { username: socket.user.username, socketIds: new Set() });
      }
      userMap.get(userId).socketIds.add(socket.id);

      if (!documentRooms.has(documentId)) {
        documentRooms.set(documentId, new Set());
      }
      documentRooms.get(documentId).add(socket.id);

      // Notify others
      socket.to(documentId).emit('user-joined', {
        userId: userId,
        username: socket.user.username,
        timestamp: new Date()
      });

      // Send current document state
      socket.emit('document-state', {
        content: document.content,
        title: document.title
      });

      // Send list of active users
      const users = Array.from(userMap.entries()).map(([uid, userData]) => ({
        userId: uid,
        username: userData.username
      }));
      socket.emit('active-users', users);
      io.to(documentId).emit('active-users', users);
    } catch (error) {
      console.error('Join document error:', error);
      socket.emit('error', { message: 'Failed to join document' });
    }
  });

  // Leave document
  socket.on('leave-document', ({ documentId }) => {
    socket.leave(documentId);

    if (activeUsers.has(documentId)) {
      const userMap = activeUsers.get(documentId);
      const userId = socket.user._id.toString();
      if (userMap.has(userId)) {
        userMap.get(userId).socketIds.delete(socket.id);
        if (userMap.get(userId).socketIds.size === 0) {
          userMap.delete(userId);
        }
      }
      if (userMap.size === 0) {
        activeUsers.delete(documentId);
      } else {
        // Update active users list
        const users = Array.from(userMap.entries()).map(([uid, userData]) => ({
          userId: uid,
          username: userData.username
        }));
        io.to(documentId).emit('active-users', users);
      }
    }

    if (documentRooms.has(documentId)) {
      documentRooms.get(documentId).delete(socket.id);
      if (documentRooms.get(documentId).size === 0) {
        documentRooms.delete(documentId);
      }
    }

    socket.to(documentId).emit('user-left', {
      userId: socket.user._id.toString(),
      username: socket.user.username,
      timestamp: new Date()
    });
  });

  // Handle text changes
  socket.on('text-change', async ({ documentId, delta, content }) => {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        return;
      }

      // Check edit permissions
      const isOwner = document.owner.toString() === socket.user._id.toString();
      const permission = document.permissions.find(p => p.user.toString() === socket.user._id.toString());
      const canEdit = isOwner || (permission && permission.role !== 'viewer');

      if (!canEdit) {
        socket.emit('error', { message: 'You do not have permission to edit this document' });
        return;
      }

      // Broadcast to other users in the room (include full HTML to avoid drift)
      socket.to(documentId).emit('text-change', {
        delta,
        content,
        userId: socket.user._id.toString(),
        username: socket.user.username,
        timestamp: new Date()
      });

      // Update document (auto-save will handle persistence)
      document.content = content;
      document.lastModified = new Date();
      document.lastModifiedBy = socket.user._id;
      
      // Debounce saves - only save every 30 seconds
      if (saveTimers.has(documentId)) {
        clearTimeout(saveTimers.get(documentId));
      }
      
      const timer = setTimeout(async () => {
        try {
          const doc = await Document.findById(documentId);
          if (doc) {
            doc.content = content;
            doc.lastModified = new Date();
            doc.lastModifiedBy = socket.user._id;
            await doc.save();
            io.to(documentId).emit('document-saved', {
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Auto-save error:', error);
        } finally {
          saveTimers.delete(documentId);
        }
      }, 30000);
      
      saveTimers.set(documentId, timer);
    } catch (error) {
      console.error('Text change error:', error);
      socket.emit('error', { message: 'Failed to sync changes' });
    }
  });

  // Handle cursor movements
  socket.on('cursor-move', ({ documentId, position }) => {
    socket.to(documentId).emit('cursor-move', {
      userId: socket.user._id.toString(),
      username: socket.user.username,
      position,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username} (${socket.id})`);

    // Remove from all document rooms
    documentRooms.forEach((socketIds, documentId) => {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        
        if (activeUsers.has(documentId)) {
          const userMap = activeUsers.get(documentId);
          const userId = socket.user._id.toString();
          if (userMap.has(userId)) {
            userMap.get(userId).socketIds.delete(socket.id);
            if (userMap.get(userId).socketIds.size === 0) {
              userMap.delete(userId);
            }
          }
          if (userMap.size === 0) {
            activeUsers.delete(documentId);
          } else {
            // Update active users list
            const users = Array.from(userMap.entries()).map(([uid, userData]) => ({
              userId: uid,
              username: userData.username
            }));
            socket.to(documentId).emit('active-users', users);
          }
        }
        
        socket.to(documentId).emit('user-left', {
          userId: socket.user._id.toString(),
          username: socket.user.username,
          timestamp: new Date()
        });

        if (socketIds.size === 0) {
          documentRooms.delete(documentId);
          // Clear save timer if no one is editing
          if (saveTimers.has(documentId)) {
            clearTimeout(saveTimers.get(documentId));
            saveTimers.delete(documentId);
          }
        }
      }
    });
  });
};

module.exports = { handleSocketConnection };

