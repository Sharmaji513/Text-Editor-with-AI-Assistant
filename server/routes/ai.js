const express = require('express');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { aiTextValidation } = require('../middleware/validation');
const { sanitizeInput } = require('../utils/sanitize');
const {
  grammarCheck,
  enhanceText,
  summarizeText,
  autoComplete,
  getSuggestions
} = require('../services/geminiService');

const router = express.Router();

// List available models for this API key (debug aid)
router.get('/models', authenticate, aiLimiter, async (req, res) => {
  try {
    const { fetchAvailableModels, getResolvedModelName } = require('../config/gemini');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'GEMINI_API_KEY not set' });
    const models = await fetchAvailableModels(apiKey);
    res.json({
      resolvedModel: getResolvedModelName?.(),
      models
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list models', details: error.message });
  }
});

// Grammar and style check
router.post('/grammar-check', authenticate, aiLimiter, aiTextValidation, async (req, res) => {
  try {
    const { text } = req.body;
    const sanitizedText = sanitizeInput(text);

    const result = await grammarCheck(sanitizedText);
    res.json({ result });
  } catch (error) {
    console.error('Grammar check error:', error);
    res.status(500).json({ error: 'Failed to check grammar. Please try again.', details: error.message });
  }
});

// Enhance writing
router.post('/enhance', authenticate, aiLimiter, aiTextValidation, async (req, res) => {
  try {
    const { text } = req.body;
    const sanitizedText = sanitizeInput(text);

    const enhanced = await enhanceText(sanitizedText);
    res.json({ enhanced });
  } catch (error) {
    console.error('Enhance text error:', error);
    res.status(500).json({ error: 'Failed to enhance text. Please try again.', details: error.message });
  }
});

// Summarize text
router.post('/summarize', authenticate, aiLimiter, aiTextValidation, async (req, res) => {
  try {
    const { text } = req.body;
    const sanitizedText = sanitizeInput(text);

    const summary = await summarizeText(sanitizedText);
    res.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Failed to summarize text. Please try again.', details: error.message });
  }
});

// Auto-complete text
router.post('/complete', authenticate, aiLimiter, async (req, res) => {
  try {
    const { text, context } = req.body;
    const sanitizedText = sanitizeInput(text || '');
    const sanitizedContext = sanitizeInput(context || '');

    const completion = await autoComplete(sanitizedText, sanitizedContext);
    res.json({ completion });
  } catch (error) {
    console.error('Auto-complete error:', error);
    res.status(500).json({ error: 'Failed to generate completion. Please try again.', details: error.message });
  }
});

// Get writing suggestions
router.post('/suggestions', authenticate, aiLimiter, aiTextValidation, async (req, res) => {
  try {
    const { text, type } = req.body;
    const sanitizedText = sanitizeInput(text);

    const suggestions = await getSuggestions(sanitizedText, type);
    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions. Please try again.', details: error.message });
  }
});

module.exports = router;

