import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Tabs, Tab, CircularProgress, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  AutoFixHigh as AutoFixHighIcon,
  Summarize as SummarizeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { aiService } from '../services/api';
import { toast } from 'react-toastify';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function AIAssistant({ content, onClose, selectedText: externalSelectedText = '' }) {
  const [tab, setTab] = useState(0);
  const [internalSelectedText, setInternalSelectedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const effectiveSelection = (externalSelectedText || internalSelectedText || '').trim();

  const handleTextSelection = () => {
    const selection = window.getSelection().toString();
    setInternalSelectedText(selection);
  };

  const handleGrammarCheck = async () => {
    const text = effectiveSelection || content;
    if (!text.trim()) {
      toast.error('Please select text or ensure document has content');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.grammarCheck(text);
      setResults({ ...results, grammar: response.result });
    } catch (error) {
      toast.error('Failed to check grammar');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    const text = effectiveSelection || content;
    if (!text.trim()) {
      toast.error('Please select text or ensure document has content');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.enhance(text);
      setResults({ ...results, enhanced: response.enhanced });
    } catch (error) {
      toast.error('Failed to enhance text');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    const text = effectiveSelection || content;
    if (!text.trim()) {
      toast.error('Please select text or ensure document has content');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.summarize(text);
      setResults({ ...results, summary: response.summary });
    } catch (error) {
      toast.error('Failed to summarize text');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    const text = effectiveSelection || content;
    if (!text.trim()) {
      toast.error('Please select text or ensure document has content');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.getSuggestions(text);
      setResults({ ...results, suggestions: response.suggestions });
    } catch (error) {
      toast.error('Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        style={{ width: 420, height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">AI Assistant</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label="Grammar" />
          <Tab label="Enhance" />
          <Tab label="Summarize" />
          <Tab label="Suggestions" />
        </Tabs>
      </Box>

      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          {effectiveSelection ? `Selected: "${effectiveSelection.substring(0, 50)}..."` : 'No text selected'}
        </Typography>
        <Button size="small" onClick={handleTextSelection} sx={{ mt: 1 }}>
          Use current selection
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TabPanel value={tab} index={0}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={handleGrammarCheck}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Check Grammar
          </Button>
          {results.grammar && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: '#fff', color: '#000' }}>
              <Typography variant="subtitle2" gutterBottom>
                Corrected Text:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                {results.grammar.corrected_text}
              </Typography>
              {results.grammar.errors && results.grammar.errors.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Errors Found:
                  </Typography>
                  <List dense>
                    {results.grammar.errors.map((error, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={`"${error.original}" → "${error.correction}"`}
                          secondary={error.explanation}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AutoFixHighIcon />}
            onClick={handleEnhance}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Enhance Text
          </Button>
          {results.enhanced && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: '#fff', color: '#000' }}>
              <Typography variant="subtitle2" gutterBottom>
                Enhanced Text:
              </Typography>
              <Typography variant="body2" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                {results.enhanced}
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SummarizeIcon />}
            onClick={handleSummarize}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Summarize
          </Button>
          {results.summary && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: '#fff', color: '#000' }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary:
              </Typography>
              <Typography variant="body2" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                {results.summary}
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<LightbulbIcon />}
            onClick={handleGetSuggestions}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Get Suggestions
          </Button>
          {results.suggestions && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: '#fff', color: '#000' }}>
              <Typography variant="subtitle2" gutterBottom>
                Writing Suggestions:
              </Typography>
              <List dense>
                {results.suggestions.map((suggestion, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={suggestion} primaryTypographyProps={{ sx: { color: '#000' } }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </TabPanel>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
      </motion.div>
    </AnimatePresence>
  );
}

export default AIAssistant;

