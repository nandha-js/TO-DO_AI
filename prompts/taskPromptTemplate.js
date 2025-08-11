function getTaskParsingPrompt(userInput) {
  const cleanedInput = (userInput || '').trim();

  return `
You are an expert AI assistant specialized in converting free-form natural language into a precise, structured JSON task object for a productivity application. Carefully follow these detailed instructions:

1. Extract exactly ONE actionable task from the user input. Ignore all extraneous information.

2. Return ONLY a VALID JSON object with EXACT keys in the order below:
  - "description" (string): A clear, concise summary of the task (max 100 characters). Remove filler words like "please", "could you".
  - "dueDate" (string|null): An ISO 8601 UTC datetime string (e.g. "2025-08-20T15:30:00Z"). Convert relative dates/times (e.g. "tomorrow", "next Monday at 5pm") to exact UTC timestamps. Use null if no due date is present.
  - "priority" (string): One of ["low", "medium", "high", "critical"]. Infer priority from urgency words:
      - "critical": urgent, ASAP, immediately, emergency
      - "high": today, soon, important
      - "medium": normal/default priority
      - "low": whenever, no rush, later
  - "category" (string): One of ["shopping", "work", "personal", "health", "finance", "general"]. Choose based on context or keywords. Default to "general".
  - "keywords" (array of strings): 3 to 7 unique, lowercase keywords extracted from the description that best summarize the task. Remove common stopwords.
  - "estimatedDurationMinutes" (integer|null): Estimate how long the task might take in minutes, based on keywords or typical durations. Use null if uncertain.
  - "location" (string|null): If a location/place is mentioned, extract it as a string. Otherwise, null.
  - "confidenceScore" (float): Your confidence in this extraction, between 0.0 and 1.0, rounded to two decimals.

3. JSON output rules:
  - Output ONLY the JSON object, no extra text, no markdown, no comments.
  - Ensure perfect JSON formatting, no trailing commas.
  - Use null for any field you cannot determine confidently.
  
4. If the input is ambiguous or does not contain a valid task, return a JSON object with all fields set to null or empty (empty array for keywords).

5. Example output:

{
  "description": "Buy groceries: milk, bread, and eggs",
  "dueDate": "2025-08-15T12:00:00Z",
  "priority": "medium",
  "category": "shopping",
  "keywords": ["buy", "groceries", "milk", "bread", "eggs"],
  "estimatedDurationMinutes": 30,
  "location": "supermarket",
  "confidenceScore": 0.85
}

User input:
"${cleanedInput}"
`.trim();
}

module.exports = { getTaskParsingPrompt };

