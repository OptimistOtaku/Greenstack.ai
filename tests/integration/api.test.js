/**
 * Integration Tests — API Endpoints
 * Tests the HTTP API layer with supertest-like direct app testing.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

// Prevent dotenv from overwriting test env
process.env.GEMINI_API_KEY = '';
process.env.NODE_ENV = 'test';

const app = require('../../server/index');

let server;
let baseUrl;

/**
 * Helper to make HTTP requests to the test server.
 */
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('API Integration Tests', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  describe('GET /api/health', () => {
    it('should return operational status', async () => {
      const res = await request('GET', '/api/health');

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'operational');
      assert.strictEqual(res.body.service, 'greenstack-ai');
      assert.ok(res.body.timestamp);
      assert.strictEqual(typeof res.body.geminiConfigured, 'boolean');
      assert.strictEqual(typeof res.body.bigqueryConfigured, 'boolean');
    });

    it('should include security headers', async () => {
      const res = await request('GET', '/api/health');

      // Helmet sets these headers
      assert.ok(res.headers['x-content-type-options'], 'should have x-content-type-options');
      assert.ok(res.headers['x-frame-options'] || res.headers['content-security-policy'], 'should have frame protection');
    });
  });

  describe('POST /api/analyze/repo', () => {
    it('should return 400 when repoUrl is missing', async () => {
      const res = await request('POST', '/api/analyze/repo', {});

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    it('should return 400 for invalid GitHub URL', async () => {
      const res = await request('POST', '/api/analyze/repo', {
        repoUrl: 'https://example.com/not-github',
      });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error.includes('Invalid GitHub URL'));
    });

    it('should return 400 for URL with embedded credentials', async () => {
      const res = await request('POST', '/api/analyze/repo', {
        repoUrl: 'https://user:pass@github.com/owner/repo',
      });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error.includes('credentials'));
    });

    it('should accept valid GitHub URL format', async () => {
      // This will attempt to actually fetch from GitHub API
      // It may succeed or fail based on the repo existing, but shouldn't return 400
      const res = await request('POST', '/api/analyze/repo', {
        repoUrl: 'https://github.com/expressjs/express',
      });

      // Should NOT be a 400 (validation error)
      assert.notStrictEqual(res.status, 400);
    });
  });

  describe('POST /api/analyze/media', () => {
    it('should return 400 when required fields are missing', async () => {
      const res = await request('POST', '/api/analyze/media', {});

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error.includes('Missing required'));
    });

    it('should return 400 for invalid resolution', async () => {
      const res = await request('POST', '/api/analyze/media', {
        durationMinutes: 10,
        resolution: '8k',
        audienceScale: 1000,
      });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error.includes('resolution'));
    });

    it('should return 400 for negative duration', async () => {
      const res = await request('POST', '/api/analyze/media', {
        durationMinutes: -5,
        resolution: '1080p',
        audienceScale: 1000,
      });

      assert.strictEqual(res.status, 400);
    });

    it('should return 400 for duration exceeding 600', async () => {
      const res = await request('POST', '/api/analyze/media', {
        durationMinutes: 999,
        resolution: '1080p',
        audienceScale: 1000,
      });

      assert.strictEqual(res.status, 400);
    });

    it('should return 400 for non-numeric audience', async () => {
      const res = await request('POST', '/api/analyze/media', {
        durationMinutes: 10,
        resolution: '1080p',
        audienceScale: 'abc',
      });

      assert.strictEqual(res.status, 400);
    });

    it('should succeed with valid parameters', async () => {
      const res = await request('POST', '/api/analyze/media', {
        durationMinutes: 10,
        resolution: '1080p',
        audienceScale: 1000,
        codec: 'h264',
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.analysis);
      assert.ok(res.body.strategies);
    });

    it('should include carbon footprint in response', async () => {
      const res = await request('POST', '/api/analyze/media', {
        durationMinutes: 10,
        resolution: '1080p',
        audienceScale: 1000,
      });

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.analysis.footprint);
      assert.ok(res.body.analysis.footprint.carbon);
      assert.ok(res.body.analysis.footprint.dataTransfer);
    });

    it('should default codec to h264 when not provided', async () => {
      const res = await request('POST', '/api/analyze/media', {
        durationMinutes: 10,
        resolution: '1080p',
        audienceScale: 1000,
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.analysis.footprint.input.codec, 'h264');
    });
  });

  describe('POST /api/translate', () => {
    it('should return 400 when targetLanguage is missing', async () => {
      const res = await request('POST', '/api/translate', { text: 'hello' });

      assert.strictEqual(res.status, 400);
    });

    it('should return 400 for invalid language code', async () => {
      const res = await request('POST', '/api/translate', {
        text: 'hello',
        targetLanguage: 'xx',
      });

      assert.strictEqual(res.status, 400);
    });

    it('should return graceful fallback when translation service unavailable', async () => {
      const res = await request('POST', '/api/translate', {
        text: 'hello',
        targetLanguage: 'es',
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      // Without credentials, it should return original text
      assert.ok(res.body.translatedText);
    });
  });
});
