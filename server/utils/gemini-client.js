/**
 * Gemini Client — Wraps @google/generative-ai SDK for structured JSON responses.
 * All agents use this client to interact with gemini-2.5-flash.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

/** Maximum time (ms) to wait for a Gemini response. */
const GEMINI_TIMEOUT_MS = 25000;

/** Maximum retries on transient errors (429, 503). */
const MAX_RETRIES = 1;

function getModel() {
  if (model) return model;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  return model;
}

/**
 * Wrap a promise with a timeout.
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} The original promise or a rejection on timeout
 */
function withTimeout(promise, ms) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

/**
 * Check if an error is retryable (rate limit or transient server error).
 * @param {Error} error
 * @returns {boolean}
 */
function isRetryableError(error) {
  const message = error.message || '';
  return message.includes('429') || message.includes('503') || message.includes('RESOURCE_EXHAUSTED');
}

/**
 * Generate a structured JSON response from Gemini.
 *
 * @param {string} systemPrompt - System instruction defining the agent's role
 * @param {string} userContext - The user-facing prompt with data to analyze
 * @returns {Object|null} Parsed JSON response from the model, or null on failure
 */
async function generateStructuredResponse(systemPrompt, userContext) {
  const geminiModel = getModel();

  if (!geminiModel) {
    console.warn('⚠️  Gemini API key not configured — returning fallback response');
    return null;
  }

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, etc.
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        console.log(`🔄 Gemini retry attempt ${attempt}/${MAX_RETRIES}`);
      }

      const result = await withTimeout(
        geminiModel.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: userContext }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 8192,
          },
        }),
        GEMINI_TIMEOUT_MS
      );

      const response = result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        // Sometimes the model wraps JSON in markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1].trim());
        }
        console.error('Failed to parse Gemini response as JSON:', text.substring(0, 200));
        return null;
      }
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt >= MAX_RETRIES) {
        break;
      }
    }
  }

  console.error('Gemini API error:', lastError.message);
  throw new Error(`AI analysis failed: ${lastError.message}`);
}

/**
 * Check if Gemini is configured and available.
 * @returns {boolean}
 */
function isGeminiAvailable() {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!apiKey && apiKey !== 'your_gemini_api_key_here';
}

module.exports = {
  generateStructuredResponse,
  isGeminiAvailable,
};
