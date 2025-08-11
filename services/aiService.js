const axios = require('axios');
const { getTaskParsingPrompt } = require('./getTaskParsingPrompt'); // adjust path as needed

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Parses a natural language task input into structured task data using OpenAI
 * @param {string} rawInput - The raw task input from the user
 * @returns {Promise<Object>} - Parsed task fields: description, dueDate, priority, category
 */
async function parseTask(rawInput) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not set in environment variables');
  }

  const prompt = getTaskParsingPrompt(rawInput);

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI that extracts structured task information in JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const completionText = response.data.choices[0].message.content.trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(completionText);
    } catch (e) {
      console.warn('AI returned invalid JSON, using defaults:', completionText);
      parsedResult = {};
    }

    // Normalize and apply defaults
    const normalized = {
      description: parsedResult.description?.trim() || rawInput.trim(),
      dueDate: parsedResult.dueDate || null,
      priority: ['low', 'medium', 'high'].includes(parsedResult.priority)
        ? parsedResult.priority
        : 'medium',
      category: parsedResult.category || 'general',
    };

    return normalized;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    return {
      description: rawInput.trim(),
      dueDate: null,
      priority: 'medium',
      category: 'general',
    };
  }
}

module.exports = { parseTask };
