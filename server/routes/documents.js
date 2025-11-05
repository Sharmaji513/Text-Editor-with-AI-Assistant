const express = require('express');
const crypto = require('crypto');
const Document = require('../models/Document');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { documentValidation } = require('../middleware/validation');
const { sanitizeInput, sanitizeHTML } = require('../utils/sanitize');

const router = express.Router();

// Get user's documents
router.get('/', authenticate, apiLimiter, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user._id },
        { 'permissions.user': req.user._id }
      ]
    })
    .populate('owner', 'username email')
    .populate('permissions.user', 'username email')
    .sort({ lastModified: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new document
router.post('/', authenticate, apiLimiter, documentValidation, async (req, res) => {
  try {
    const { title, content } = req.body;
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = content ? sanitizeHTML(content) : '';

    const document = new Document({
      title: sanitizedTitle,
      content: sanitizedContent,
      owner: req.user._id,
      permissions: [{
        user: req.user._id,
        role: 'owner'
      }]
    });

    await document.save();
    await document.populate('owner', 'username email');

    res.status(201).json({ document });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific document
router.get('/:id', authenticate, apiLimiter, async (req, res) => {
  try {
    // Check if ID is a valid MongoDB ObjectId (24 characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    if (!isValidObjectId) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const document = await Document.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('permissions.user', 'username email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions
    const hasAccess = document.owner._id.toString() === req.user._id.toString() ||
      document.permissions.some(p => p.user._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update document
router.put('/:id', authenticate, apiLimiter, async (req, res) => {
  try {
    // Check if ID is a valid MongoDB ObjectId (24 characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    if (!isValidObjectId) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions (owner or editor)
    const isOwner = document.owner.toString() === req.user._id.toString();
    const permission = document.permissions.find(p => p.user.toString() === req.user._id.toString());
    const canEdit = isOwner || (permission && permission.role !== 'viewer');

    if (!canEdit) {
      return res.status(403).json({ error: 'You do not have permission to edit this document' });
    }

    if (req.body.title !== undefined) {
      document.title = sanitizeInput(req.body.title);
    }
    if (req.body.content !== undefined) {
      document.content = sanitizeHTML(req.body.content);
    }

    document.lastModified = new Date();
    document.lastModifiedBy = req.user._id;

    await document.save();
    await document.populate('owner', 'username email');
    await document.populate('permissions.user', 'username email');

    res.json({ document });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete document
router.delete('/:id', authenticate, apiLimiter, async (req, res) => {
  try {
    // Check if ID is a valid MongoDB ObjectId (24 characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    if (!isValidObjectId) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Only owner can delete
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the owner can delete this document' });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate share link
router.post('/:id/share', authenticate, apiLimiter, async (req, res) => {
  try {
    // Check if ID is a valid MongoDB ObjectId (24 characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    if (!isValidObjectId) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Only owner can generate share link
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the owner can generate share links' });
    }

    // Generate unique share link
    const shareLink = crypto.randomBytes(32).toString('hex');
    document.shareLink = shareLink;
    await document.save();

    res.json({ shareLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/document/${shareLink}` });
  } catch (error) {
    console.error('Share link error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get document by share link
router.get('/share/:shareLink', authenticate, apiLimiter, async (req, res) => {
  try {
    const document = await Document.findOne({ shareLink: req.params.shareLink })
      .populate('owner', 'username email')
      .populate('permissions.user', 'username email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Add user to document permissions if not already present
    const userAlreadyHasAccess = document.permissions.some(
      p => p.user._id.toString() === req.user._id.toString()
    ) || document.owner._id.toString() === req.user._id.toString();

    if (!userAlreadyHasAccess) {
      // Add user as editor by default when accessing via share link
      document.permissions.push({
        user: req.user._id,
        role: 'editor'
      });
      await document.save();
      // Re-populate after save
      await document.populate('permissions.user', 'username email');
    }

    res.json({ document });
  } catch (error) {
    console.error('Get shared document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

