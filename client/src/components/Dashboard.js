import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/api';
import { toast } from 'react-toastify';

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [query, setQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await documentService.getDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    try {
      const response = await documentService.createDocument(newDocTitle);
      toast.success('Document created!');
      setCreateDialogOpen(false);
      setNewDocTitle('');
      navigate(`/document/${response.document._id}`);
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted');
      loadDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleShareDocument = async (id) => {
    try {
      const response = await documentService.shareDocument(id);
      setShareLink(response.shareLink);
      setShareDialogOpen(true);
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard!');
  };

  const isOwner = (doc) => {
    const ownerId = doc.owner?._id || doc.owner;
    const userId = user?.id || user?._id;
    return ownerId && userId && ownerId.toString() === userId.toString();
  };

  const filteredDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => (d.title || 'Untitled').toLowerCase().includes(q));
  }, [documents, query]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Documents</Typography>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)} sx={{ mr: 1 }}>
            New Document
          </Button>
          <Button variant="outlined" onClick={logout}>
            Logout ({user?.username})
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search documents"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ width: 360, maxWidth: '100%' }}
        />
        <Typography variant="body2" color="text.secondary">{filteredDocuments.length} result{filteredDocuments.length === 1 ? '' : 's'}</Typography>
      </Box>

      {loading ? (
        <Typography>Loading documents...</Typography>
      ) : filteredDocuments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {documents.length === 0 ? 'No documents yet' : 'No matches found'}
          </Typography>
          <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>Create a document</Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <List>
            {filteredDocuments.map((doc, idx) => (
              <motion.div key={doc._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.02, 0.2) }}>
                <ListItem button onClick={() => navigate(`/document/${doc._id}`)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 600 }}>{doc.title || 'Untitled'}</Typography>}
                    secondary={`Last modified: ${new Date(doc.lastModified).toLocaleString()}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={isOwner(doc) ? 'Owner' : 'Shared'} size="small" color={isOwner(doc) ? 'primary' : 'default'} sx={{ mr: 1 }} />
                    <IconButton edge="end" onClick={(e) => { e.stopPropagation(); handleShareDocument(doc._id); }} size="small">
                      <ShareIcon />
                    </IconButton>
                    {isOwner(doc) && (
                      <IconButton edge="end" onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc._id); }} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Paper>
      )}

      {/* Create Document Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Title"
            fullWidth
            variant="outlined"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateDocument();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateDocument} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Link Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share this link with others to give them access:
          </Typography>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true
            }}
            onClick={(e) => e.target.select()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button onClick={copyShareLink} variant="contained">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;

