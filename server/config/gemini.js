const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;
let resolvedModelName = null;

// List models via REST to discover what this API key supports
const fetchAvailableModels = async (apiKey) => {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models : [];
    return models.map(m => ({
      name: (m.name || '').replace(/^models\//, ''),
      methods: m.supportedGenerationMethods || []
    }));
  } catch (_) {
    return [];
  }
};

const initializeGemini = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. AI features will be disabled.');
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);

    // Discover available models and their methods
    const available = await fetchAvailableModels(apiKey);
    const generateCapable = available.filter(m => m.methods?.includes('generateContent'));

    // Prepare preference order
    const preferred = [
      modelName,
      `${modelName}-latest`,
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash-8b-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.0-pro',
      'gemini-1.0-pro-latest',
      'gemini-pro'
    ];

    // Pick the first preferred that is available and supports generateContent
    let chosen = preferred.find(name => generateCapable.some(m => m.name === name));
    if (!chosen && generateCapable.length > 0) {
      chosen = generateCapable[0].name;
    }

    if (!chosen) {
      throw new Error(`No supported Gemini model found for this API key.`);
    }

    resolvedModelName = chosen;
    model = genAI.getGenerativeModel({ model: chosen });
    console.log(`Google Gemini initialized with model: ${chosen}`);
    return model;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return null;
  }
};

const getModel = async () => {
  if (!model) {
    return await initializeGemini();
  }
  return model;
};

module.exports = {
  initializeGemini,
  getModel,
  fetchAvailableModels,
  getResolvedModelName: () => resolvedModelName
};

