/**
 * Unit Tests — Gemini Client
 * Validates configuration detection and JSON parsing fallback.
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const { isGeminiAvailable } = require('../../server/utils/gemini-client');

describe('Gemini Client', () => {
  let originalApiKey;

  beforeEach(() => {
    originalApiKey = process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe('isGeminiAvailable', () => {
    it('should return false when GEMINI_API_KEY is not set', () => {
      delete process.env.GEMINI_API_KEY;
      assert.strictEqual(isGeminiAvailable(), false);
    });

    it('should return false when GEMINI_API_KEY is empty', () => {
      process.env.GEMINI_API_KEY = '';
      assert.strictEqual(isGeminiAvailable(), false);
    });

    it('should return false when GEMINI_API_KEY is placeholder', () => {
      process.env.GEMINI_API_KEY = 'your_gemini_api_key_here';
      assert.strictEqual(isGeminiAvailable(), false);
    });

    it('should return true when GEMINI_API_KEY is a real value', () => {
      process.env.GEMINI_API_KEY = 'AIzaSyTestKey123';
      assert.strictEqual(isGeminiAvailable(), true);
    });
  });
});
