/**
 * Translation Service — Google Cloud Translation API wrapper.
 *
 * This service is OPTIONAL and will gracefully no-op when
 * GOOGLE_APPLICATION_CREDENTIALS is not configured.
 */

let translationClient = null;
let isAvailable = false;

function init() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('⏭️  Translation: Skipped (GOOGLE_APPLICATION_CREDENTIALS not set)');
    return;
  }

  try {
    const { Translate } = require('@google-cloud/translate').v2;
    translationClient = new Translate();
    isAvailable = true;
    console.log('✅ Translation: Connected');
  } catch {
    console.warn('⚠️  Translation: Package not installed. Run: npm install @google-cloud/translate');
    isAvailable = false;
  }
}

/**
 * Translate text to a target language using Google Cloud Translation API.
 * Returns original text when service is unavailable.
 *
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - ISO 639-1 language code (e.g., 'es', 'fr', 'de')
 * @returns {{ translatedText: string, detectedLanguage: string, isTranslated: boolean }}
 */
async function translateText(text, targetLanguage) {
  if (!isAvailable || !translationClient) {
    return {
      translatedText: text,
      detectedLanguage: 'en',
      isTranslated: false,
      note: 'Translation service unavailable — configure GOOGLE_APPLICATION_CREDENTIALS.',
    };
  }

  try {
    const [translation] = await translationClient.translate(text, targetLanguage);
    return {
      translatedText: translation,
      detectedLanguage: 'auto',
      isTranslated: true,
    };
  } catch (error) {
    console.warn('⚠️  Translation failed:', error.message);
    return {
      translatedText: text,
      detectedLanguage: 'en',
      isTranslated: false,
      note: `Translation error: ${error.message}`,
    };
  }
}

/**
 * Batch translate multiple text strings.
 *
 * @param {string[]} texts - Array of strings to translate
 * @param {string} targetLanguage - ISO 639-1 language code
 * @returns {Array<{ translatedText: string, isTranslated: boolean }>}
 */
async function batchTranslate(texts, targetLanguage) {
  if (!isAvailable || !translationClient) {
    return texts.map((text) => ({
      translatedText: text,
      isTranslated: false,
    }));
  }

  try {
    const [translations] = await translationClient.translate(texts, targetLanguage);
    const results = Array.isArray(translations) ? translations : [translations];
    return results.map((t) => ({
      translatedText: t,
      isTranslated: true,
    }));
  } catch (error) {
    console.warn('⚠️  Batch translation failed:', error.message);
    return texts.map((text) => ({
      translatedText: text,
      isTranslated: false,
    }));
  }
}

// Initialize on module load
init();

module.exports = {
  translateText,
  batchTranslate,
  isAvailable: () => isAvailable,
};
