/**
 * BigQuery Service — Audit event streaming for historical tracking.
 *
 * This service is OPTIONAL and will gracefully no-op when
 * GOOGLE_APPLICATION_CREDENTIALS is not configured.
 */

let bigqueryClient = null;
let isAvailable = false;

function init() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('⏭️  BigQuery: Skipped (GOOGLE_APPLICATION_CREDENTIALS not set)');
    return;
  }

  try {
    // Dynamic import — only load if credentials exist
    const { BigQuery } = require('@google-cloud/bigquery');
    bigqueryClient = new BigQuery();
    isAvailable = true;
    console.log('✅ BigQuery: Connected');
  } catch (error) {
    console.warn('⚠️  BigQuery: Package not installed. Run: npm install @google-cloud/bigquery');
    isAvailable = false;
  }
}

/**
 * Stream an audit event to BigQuery.
 * No-op when BigQuery is unavailable.
 *
 * @param {string} eventType - 'repo_analysis' | 'media_analysis'
 * @param {Object} payload - Event data
 */
async function logAuditEvent(eventType, payload) {
  if (!isAvailable || !bigqueryClient) return;

  try {
    const dataset = bigqueryClient.dataset('greenstack_analytics');
    const table = dataset.table('audit_events');

    await table.insert([{
      event_type: eventType,
      payload: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
    }]);
  } catch (error) {
    // Non-critical — log but don't throw
    console.warn('⚠️  BigQuery insert failed:', error.message);
  }
}

// Initialize on module load
init();

module.exports = {
  logAuditEvent,
  isAvailable: () => isAvailable,
};
