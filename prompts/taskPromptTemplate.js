/**
 * Constructs a well-structured prompt for AI to parse natural language task input
 * into a strict JSON format for the productivity app.
 *
 * @param {string} userInput - User's natural language task input
 * @returns {string} - Formatted AI system prompt string
 */
function getTaskParsingPrompt(userInput) {
  const cleanedInput = (userInput || '').trim();

  return `
You are an AI task parser for a productivity app. 
Extract exactly one primary actionable task from the given natural language input 
and return it as a STRICT JSON object following the required format.

### Rules:
1. Output ONLY a valid JSON object — no extra text, no explanations, no markdown.
2. JSON keys (in this exact order): description, dueDate, priority, category.
3. "description": 
   - Short (max ~100 chars), human-readable summary of the task.
   - Remove filler words like "please", "could you", etc.
4. "dueDate": 
   - ISO 8601 UTC format (YYYY-MM-DDTHH:mm:ssZ), e.g., "2025-08-10T14:30:00Z".
   - If no date/time is explicitly given or inferred, use null.
   - Convert relative dates ("tomorrow", "next Monday", "in 3 days") to exact ISO dates.
5. "priority":
   - One of ["low", "medium", "high"].
   - Infer from urgency words (e.g., "urgent", "ASAP" → high; "whenever" → low; otherwise medium).
6. "category":
   - Choose from ["shopping", "work", "personal", "health", "finance", "general"].
   - Detect from task content. Default to "general".
7. No trailing commas, no comments.

### User Input:
"${cleanedInput}"

### Example Output:
{
  "description": "Submit project report",
  "dueDate": "2025-08-12T17:00:00Z",
  "priority": "high",
  "category": "work"
}
`;
}

module.exports = {
  getTaskParsingPrompt,
};
