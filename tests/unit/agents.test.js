/**
 * Unit Tests — AI Agents and Translation Service
 * Validates the core calculation and fallback behaviors of the agent pipeline.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { orchestrateMediaAnalysis } = require('../../server/agents/orchestrator');
const { analyzeDevInfrastructure } = require('../../server/agents/devGreenOps');
const { analyzeMediaStreaming } = require('../../server/agents/mediaStreaming');
const { generateDevStrategies, generateMediaStrategies } = require('../../server/agents/strategist');
const { translateText, batchTranslate } = require('../../server/services/translation.service');

describe('AI Agents & Services', () => {
  
  describe('Orchestrator Agent', () => {
    it('should coordinate media analysis pipeline correctly', async () => {
      const result = await orchestrateMediaAnalysis({
        durationMinutes: 10,
        resolution: '1080p',
        codec: 'h264',
        audienceScale: 1000
      });
      assert.ok(result.analysis);
      assert.ok(result.strategies);
      assert.ok(result.analysis.footprint);
    });
  });

  describe('DevGreenOps Agent', () => {
    it('should generate proper metrics and fallbacks for empty manifests', async () => {
      const manifests = { packageJson: null, dockerfile: null, workflows: [] };
      const analysis = await analyzeDevInfrastructure(manifests);
      assert.ok(analysis.localMetrics);
      assert.strictEqual(analysis.localMetrics.totalDeps, undefined);
      assert.strictEqual(analysis.localMetrics.estimatedCarbonGrams, 0);
    });

    it('should calculate metrics when packageJson is present', async () => {
      const manifests = {
        packageJson: {
          dependencies: { express: '^4.17.1', lodash: '^4.17.21' }
        },
        dockerfile: null,
        workflows: []
      };
      const analysis = await analyzeDevInfrastructure(manifests);
      assert.strictEqual(analysis.localMetrics.totalDeps, 2);
      assert.ok(analysis.localMetrics.estimatedEnergyKWh > 0);
    });
  });

  describe('MediaStreaming Agent', () => {
    it('should calculate CDN footprint and insights correctly', async () => {
      const params = {
        durationMinutes: 60,
        resolution: '4k',
        codec: 'h264',
        audienceScale: 1000000
      };
      const analysis = await analyzeMediaStreaming(params);
      assert.ok(analysis.footprint);
      assert.ok(analysis.aiAnalysis);
      assert.ok(analysis.footprint.carbon.totalKg > 0);
    });
  });

  describe('Mitigation Strategist Agent', () => {
    it('should generate strategies for dev context', async () => {
      const mockAnalysis = {
        localMetrics: {
          hasPackageJson: true,
          hasDockerfile: false,
          hasWorkflows: false
        }
      };
      const strategies = await generateDevStrategies(mockAnalysis);
      assert.ok(strategies.strategies);
      assert.ok(strategies.strategies.length > 0);
    });

    it('should generate strategies for media context', async () => {
      const mockAnalysis = {
        footprint: {
          carbon: { totalKg: 500 },
          equivalencies: { carKm: 1200 },
          codecComparison: {
            av1: { carbonKg: 175 }
          }
        }
      };
      const strategies = await generateMediaStrategies(mockAnalysis);
      assert.ok(strategies.strategies);
      assert.ok(strategies.strategies.length > 0);
    });
  });

  describe('Translation Service', () => {
    it('should fallback gracefully when translation is not initialized', async () => {
      const res = await translateText('Hello', 'es');
      assert.strictEqual(res.translatedText, 'Hello');
      assert.strictEqual(res.isTranslated, false);
    });

    it('should batch translate fallback gracefully', async () => {
      const res = await batchTranslate(['Hello', 'World'], 'es');
      assert.strictEqual(res[0].translatedText, 'Hello');
      assert.strictEqual(res[1].translatedText, 'World');
      assert.strictEqual(res[0].isTranslated, false);
    });
  });
});
