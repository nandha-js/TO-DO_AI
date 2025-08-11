// services/openaiService.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract 3 to 5 keywords from given text using OpenAI GPT-3.5 Turbo
 * @param {string} text
 * @returns {Promise<string[]>} Array of keywords
 */
async function extractKeywords(text) {
  if (!text || text.trim() === "") return [];

  const prompt = `Extract 3 to 5 keywords from the following text. Return as a JSON array of strings:\n\n"${text}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that extracts keywords." },
        { role: "user", content: prompt },
      ],
      max_tokens: 60,
      temperature: 0.3,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["\n"],
    });

    const keywordsText = response.choices[0].message.content.trim();

    // Safely parse JSON output
    try {
      const keywords = JSON.parse(keywordsText);
      return Array.isArray(keywords) ? keywords : [];
    } catch {
      // If parsing fails, return empty array or log for debugging
      console.warn("Warning: Could not parse keywords JSON:", keywordsText);
      return [];
    }
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error("OpenAI API quota exceeded.");
      // You can throw or return a specific error here
      return [];
    }
    console.error("OpenAI error:", error);
    return [];
  }
}

module.exports = {
  extractKeywords,
};
