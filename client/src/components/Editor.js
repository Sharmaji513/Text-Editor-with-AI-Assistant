import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Container, Paper, Typography, Button, Box, Drawer, IconButton, TextField, CircularProgress, List, ListItemButton, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Fab, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Psychology as PsychologyIcon, People as PeopleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { documentService, aiService } from '../services/api';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { toast } from 'react-toastify';
import AIAssistant from './AIAssistant';
import ActiveUsers from './ActiveUsers';

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [usersDrawerOpen, setUsersDrawerOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const lastSaveRef = useRef(null);
  const actualDocumentIdRef = useRef(null);

  useEffect(() => {
    loadDocument();
    loadDocuments();
    return () => {
      if (socketRef.current && actualDocumentIdRef.current) {
        socketRef.current.emit('leave-document', { documentId: actualDocumentIdRef.current });
        disconnectSocket();
      }
    };
  }, [id]);

  const loadDocument = async () => {
    try {
      // Check if ID is a share link (64 characters) or ObjectId (24 characters)
      const isShareLink = id.length === 64 && /^[a-f0-9]+$/i.test(id);
      
      let response;
      let actualDocumentId;
      
      if (isShareLink) {
        // Use share link endpoint
        response = await documentService.getDocumentByShareLink(id);
        actualDocumentId = response.document._id; // Use actual document ID for socket
      } else {
        // Use regular document endpoint
        response = await documentService.getDocument(id);
        actualDocumentId = id;
      }
      
      // Store actual document ID in ref for cleanup
      actualDocumentIdRef.current = actualDocumentId;
      
      const doc = response.document;
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content || '');

      // Connect socket
      const token = localStorage.getItem('token');
      const socket = connectSocket(token);
      socketRef.current = socket;

      // Use actual document ID for socket connection
      socket.emit('join-document', { documentId: actualDocumentId });

      socket.on('document-state', (data) => {
        setContent(data.content || '');
        setTitle(data.title || '');
      });

      socket.on('text-change', (data) => {
        const currentUserId = user.id || user._id;
        if (data.userId !== currentUserId) {
          // Prefer applying full HTML content to avoid drift/gibberish
          if (typeof data.content === 'string') {
            setContent(data.content);
          } else {
            const quill = quillRef.current?.getEditor();
            if (quill && data.delta) {
              quill.updateContents(data.delta, 'silent');
            }
          }
        }
      });

      // De-dupe user presence toasts
      const toastShownRef = { current: new Set() };
      socket.on('user-joined', (data) => {
        const key = `joined-${data.userId}`;
        if (!toastShownRef.current.has(key)) {
          toastShownRef.current.add(key);
          toast.info(`${data.username} joined`, { toastId: key, autoClose: 1500 });
          setTimeout(() => toastShownRef.current.delete(key), 3000);
        }
      });

      socket.on('user-left', (data) => {
        const key = `left-${data.userId}`;
        if (!toastShownRef.current.has(key)) {
          toastShownRef.current.add(key);
          toast.info(`${data.username} left`, { toastId: key, autoClose: 1500 });
          setTimeout(() => toastShownRef.current.delete(key), 3000);
        }
      });

      socket.on('active-users', (users) => {
        setActiveUsers(users);
      });

      socket.on('document-saved', () => {
        // Single sticky toast for auto-save updates
        toast.dismiss('autosave');
        toast.success('Auto-saved', { toastId: 'autosave', autoClose: 1200 });
      });

      socket.on('error', (error) => {
        toast.error(error.message || 'Connection error');
      });
    } catch (error) {
      console.error('Load document error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load document';
      toast.error(errorMessage);
      
      // If it's a share link and we get 404, the link might be invalid
      if (error.response?.status === 404) {
        toast.error('Document not found. The share link may be invalid or expired.');
      }
      
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await documentService.getDocuments();
      setDocuments(response.documents || []);
    } catch (e) {
      // silent fail in editor context
    }
  };

  const handleContentChange = (content, delta, source, editor) => {
    if (source === 'user') {
      setContent(content);

      const socket = getSocket();
      if (socket && delta) {
        // Use actual document ID (not share link if applicable)
        const docId = actualDocumentIdRef.current || document?._id || id;
        socket.emit('text-change', {
          documentId: docId,
          delta: delta,
          content: editor.getHTML()
        });
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Use actual document ID (not share link if applicable)
      const docId = actualDocumentIdRef.current || document?._id || id;
      await documentService.updateDocument(docId, {
        title,
        content
      });
      toast.success('Document saved!');
      lastSaveRef.current = new Date();
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;
    try {
      const response = await documentService.createDocument(newDocTitle);
      setCreateDialogOpen(false);
      setNewDocTitle('');
      navigate(`/document/${response.document._id}`);
    } catch (e) {
      toast.error('Failed to create document');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading document...</Typography>
      </Container>
    );
  }

  const SIDEBAR_WIDTH = 280;

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mr: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }} aria-label="Go back">
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={() => setSidebarOpen((o) => !o)} sx={{ mr: 1 }} aria-label="Toggle sidebar">
            {/* reuse PeopleIcon as generic toggle if no menu icon available */}
            <PeopleIcon />
          </IconButton>
          <TextField
          value={title}
          onChange={handleTitleChange}
          variant="outlined"
          placeholder="Untitled document"
          sx={{ flex: 1 }}
          inputProps={{ 'aria-label': 'Document title' }}
          />
        </Box>
        <Box>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} sx={{ mr: 1 }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <IconButton onClick={() => setUsersDrawerOpen(true)} sx={{ mr: 1 }}>
            <PeopleIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {activeUsers.length} active {activeUsers.length === 1 ? 'user' : 'users'}
        </Typography>
        <Button size="small" onClick={() => setUsersDrawerOpen(true)}>View users</Button>
      </Box>

      <Box sx={{ display: 'flex', minHeight: '70vh', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        {sidebarOpen && (
          <Box sx={{ width: SIDEBAR_WIDTH, borderRight: '1px solid', borderColor: 'divider', p: 1, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">Explorer</Typography>
              <Button size="small" onClick={() => setCreateDialogOpen(true)}>New</Button>
            </Box>
            <TextField size="small" placeholder="Search files" fullWidth sx={{ mb: 1 }} />
            <Divider />
            <List dense>
              {documents.map((doc) => (
                <ListItemButton key={doc._id} selected={doc._id === (actualDocumentIdRef.current || id)} onClick={() => navigate(`/document/${doc._id}`)}>
                  <ListItemText primary={doc.title || 'Untitled'} secondary={new Date(doc.lastModified).toLocaleDateString()} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}
        <Box sx={{ flex: 1, bgcolor: 'background.default' }}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            onChangeSelection={(range, source, editor) => {
              if (range && range.length > 0) {
                try {
                  const text = editor.getText(range.index, range.length);
                  setSelectedText(text.trim());
                } catch (e) {
                  setSelectedText('');
                }
              } else {
                setSelectedText('');
              }
            }}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
              ]
            }}
            style={{ height: '70vh' }}
          />
        </Box>
      </Box>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>New File</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Title" fullWidth variant="outlined" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCreateDocument(); }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateDocument}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Floating AI Assistant Button */}
      <Tooltip title="AI Assistant">
        <Fab
          color="primary"
          aria-label="Open AI Assistant"
          onClick={() => setAiDrawerOpen(true)}
          sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1500 }}
        >
          <PsychologyIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      >
        <AIAssistant
          content={content}
          selectedText={selectedText}
          onClose={() => setAiDrawerOpen(false)}
        />
      </Drawer>

      <Drawer
        anchor="right"
        open={usersDrawerOpen}
        onClose={() => setUsersDrawerOpen(false)}
      >
        <ActiveUsers users={activeUsers} />
      </Drawer>
    </Container>
  );
}

export default Editor;

