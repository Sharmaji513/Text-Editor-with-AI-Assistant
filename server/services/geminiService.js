const { getModel } = require('../config/gemini');

const callGemini = async (prompt, maxOutputTokens = 1024, options = {}) => {
  try {
    const model = await getModel();
    if (!model) {
      throw new Error('Gemini API not initialized');
    }

    // Use structured call when asking for JSON
    if (options.responseMimeType) {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens,
          responseMimeType: options.responseMimeType
        }
      });
      const response = await result.response;
      return response.text();
    }

    // Fallback: simple string call
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    // Surface clearer error messages for common cases
    if (error?.message?.includes('Not Found') || error?.message?.includes('is not found')) {
      throw new Error('Gemini model not found. Set GEMINI_MODEL (e.g., gemini-1.5-flash) in server/.env');
    }
    throw new Error('Failed to get AI response');
  }
};

const grammarCheck = async (text) => {
  const prompt = `You are a JSON-only API. Respond with STRICT JSON matching this schema, with no extra commentary or code fences.
{
  "corrected_text": string,
  "errors": [
    { "original": string, "correction": string, "explanation": string }
  ],
  "suggestions": string[]
}

Text to check:
${text}`;

  try {
    // First attempt: ask for JSON directly
    const response = await callGemini(prompt, 1024, { responseMimeType: 'application/json' });
    const cleaned = response.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    try {
      return JSON.parse(cleaned);
    } catch (_) {
      // Second attempt: force delimited JSON block
      const prompt2 = `Return ONLY a JSON object between <json> and </json> tags using this schema.
<schema>
{
  "corrected_text": string,
  "errors": [
    { "original": string, "correction": string, "explanation": string }
  ],
  "suggestions": string[]
}
</schema>
Text:
${text}
`;
      const resp2 = await callGemini(prompt2, 1024);
      const match = resp2.match(/<json>[\s\S]*?<\/json>/i);
      if (match) {
        const jsonBody = match[0].replace(/<\/?json>/gi, '').trim();
        return JSON.parse(jsonBody);
      }
      // Final attempt: extract first JSON object
      const brace = resp2.match(/\{[\s\S]*\}/);
      if (brace) {
        return JSON.parse(brace[0]);
      }
      throw new Error('parse-failed');
    }
  } catch (error) {
    return {
      corrected_text: text,
      errors: [],
      suggestions: [
        error?.message?.includes('Gemini model not found')
          ? 'AI model not found. Please set GEMINI_MODEL in server/.env (e.g., gemini-1.5-flash).'
          : 'Unable to parse AI response. Please try again.'
      ]
    };
  }
};

const enhanceText = async (text) => {
  const prompt = `Please enhance the following text to improve clarity, tone, and readability. Return only the enhanced version without additional commentary:

${text}`;

  return await callGemini(prompt, 2048);
};

const summarizeText = async (text) => {
  const prompt = `Please provide a concise summary of the following text in 2-3 sentences:

${text}`;

  return await callGemini(prompt, 512);
};

const autoComplete = async (text, context = '') => {
  const prompt = `Based on the context and the incomplete text, suggest the next few words or sentence to complete the thought naturally:

Context: ${context}
Incomplete text: ${text}

Provide only the completion, nothing else:`;

  return await callGemini(prompt, 128);
};

const getSuggestions = async (text, type = 'general') => {
  const typePrompts = {
    general: 'Provide writing suggestions to improve this text',
    creative: 'Provide creative writing suggestions',
    professional: 'Provide professional writing suggestions',
    academic: 'Provide academic writing suggestions'
  };

  const prompt = `${typePrompts[type] || typePrompts.general}. Provide 3-5 specific suggestions:

${text}`;

  try {
    const response = await callGemini(prompt);
    // Split suggestions by lines or bullets
    const suggestions = response.split('\n').filter(line => line.trim().length > 0);
    return suggestions.slice(0, 5);
  } catch (error) {
    return ['Unable to generate suggestions. Please try again.'];
  }
};

module.exports = {
  grammarCheck,
  enhanceText,
  summarizeText,
  autoComplete,
  getSuggestions
};

