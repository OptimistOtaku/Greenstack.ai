const express = require('express');
const router = express.Router();
const { translateText, batchTranslate, isAvailable } = require('../services/translation.service');

/**
 * POST /api/translate
 * Translate text to a target language using Google Cloud Translation API.
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, texts, targetLanguage } = req.body;

    // Validate target language
    const validLanguages = ['en', 'es', 'fr', 'de', 'hi', 'ja', 'ko', 'pt', 'zh', 'ar'];
    if (!targetLanguage || !validLanguages.includes(targetLanguage)) {
      return res.status(400).json({
        error: `Invalid targetLanguage. Valid options: ${validLanguages.join(', ')}`,
      });
    }

    // Batch mode
    if (Array.isArray(texts) && texts.length > 0) {
      if (texts.length > 50) {
        return res.status(400).json({ error: 'Maximum 50 text items per batch.' });
      }
      const results = await batchTranslate(texts, targetLanguage);
      return res.json({
        success: true,
        targetLanguage,
        serviceAvailable: isAvailable(),
        results,
      });
    }

    // Single text mode
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing required field: text (string) or texts (array)' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 5000 characters.' });
    }

    const result = await translateText(text, targetLanguage);
    res.json({
      success: true,
      targetLanguage,
      serviceAvailable: isAvailable(),
      ...result,
    });
  } catch (error) {
    console.error('❌ Translation error:', error.message);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message,
    });
  }
});

module.exports = router;
