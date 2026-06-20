/**
 * Unit Tests — Media Service
 * Validates streaming carbon footprint calculations across all resolutions and codecs.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { calculateStreamingFootprint } = require('../../server/services/media.service');

describe('Media Service — calculateStreamingFootprint', () => {
  const defaultParams = {
    durationMinutes: 10,
    resolution: '1080p',
    audienceScale: 1000,
    codec: 'h264',
  };

  describe('Basic output structure', () => {
    it('should return all expected top-level keys', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.ok(result.input, 'should have input');
      assert.ok(result.dataTransfer, 'should have dataTransfer');
      assert.ok(result.energy, 'should have energy');
      assert.ok(result.carbon, 'should have carbon');
      assert.ok(result.equivalencies, 'should have equivalencies');
      assert.ok(result.codecComparison, 'should have codecComparison');
      assert.ok(result.resolutionComparison, 'should have resolutionComparison');
    });

    it('should echo back input parameters', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.strictEqual(result.input.durationMinutes, 10);
      assert.strictEqual(result.input.resolution, '1080p');
      assert.strictEqual(result.input.audienceScale, 1000);
      assert.strictEqual(result.input.codec, 'h264');
    });
  });

  describe('Carbon calculations', () => {
    it('should produce non-negative carbon values', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.ok(result.carbon.totalGrams >= 0);
      assert.ok(result.carbon.totalKg >= 0);
    });

    it('should scale linearly with audience', () => {
      const small = calculateStreamingFootprint({ ...defaultParams, audienceScale: 1000 });
      const large = calculateStreamingFootprint({ ...defaultParams, audienceScale: 2000 });

      // With 2× audience, carbon should be approximately 2×
      const ratio = large.carbon.totalGrams / small.carbon.totalGrams;
      assert.ok(Math.abs(ratio - 2.0) < 0.01, `Expected ratio ~2.0, got ${ratio}`);
    });

    it('should produce higher carbon for 4K than 1080p', () => {
      const hd = calculateStreamingFootprint({ ...defaultParams, resolution: '1080p' });
      const uhd = calculateStreamingFootprint({ ...defaultParams, resolution: '4k' });

      assert.ok(uhd.carbon.totalGrams > hd.carbon.totalGrams);
    });

    it('should produce lower carbon for AV1 than H.264', () => {
      const h264 = calculateStreamingFootprint({ ...defaultParams, codec: 'h264' });
      const av1 = calculateStreamingFootprint({ ...defaultParams, codec: 'av1' });

      assert.ok(av1.carbon.totalGrams < h264.carbon.totalGrams);
    });
  });

  describe('Data transfer calculations', () => {
    it('should compute positive data transfer values', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.ok(result.dataTransfer.perViewerGB > 0);
      assert.ok(result.dataTransfer.totalGB > 0);
      assert.ok(result.dataTransfer.totalTB >= 0);
    });

    it('should have totalGB = perViewerGB * audienceScale', () => {
      const result = calculateStreamingFootprint(defaultParams);
      const expected = result.dataTransfer.perViewerGB * defaultParams.audienceScale;

      // Allow floating-point rounding
      assert.ok(Math.abs(result.dataTransfer.totalGB - Math.round(expected * 100) / 100) < 0.1);
    });
  });

  describe('Energy calculations', () => {
    it('should compute positive energy values', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.ok(result.energy.networkKWh > 0);
      assert.ok(result.energy.dataCenterKWh > 0);
      assert.ok(result.energy.totalKWh > 0);
    });

    it('should have totalKWh = networkKWh + dataCenterKWh', () => {
      const result = calculateStreamingFootprint(defaultParams);
      const expected = result.energy.networkKWh + result.energy.dataCenterKWh;

      assert.ok(Math.abs(result.energy.totalKWh - Math.round(expected * 100) / 100) < 0.1);
    });
  });

  describe('Codec comparison', () => {
    it('should include all 4 codecs', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.ok('h264' in result.codecComparison);
      assert.ok('h265' in result.codecComparison);
      assert.ok('vp9' in result.codecComparison);
      assert.ok('av1' in result.codecComparison);
    });

    it('should show AV1 as lowest carbon across codecs', () => {
      const result = calculateStreamingFootprint(defaultParams);
      const av1Carbon = result.codecComparison.av1.carbonKg;

      for (const [codec, data] of Object.entries(result.codecComparison)) {
        assert.ok(av1Carbon <= data.carbonKg, `AV1 should be <= ${codec}`);
      }
    });

    it('should show 0% savings for the active codec', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.strictEqual(result.codecComparison.h264.savingsPercent, 0);
    });
  });

  describe('Resolution comparison', () => {
    it('should include all standard resolutions', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.ok('4k' in result.resolutionComparison);
      assert.ok('1080p' in result.resolutionComparison);
      assert.ok('720p' in result.resolutionComparison);
      assert.ok('480p' in result.resolutionComparison);
    });
  });

  describe('Equivalencies', () => {
    it('should produce non-negative equivalency values', () => {
      const result = calculateStreamingFootprint(defaultParams);

      assert.ok(result.equivalencies.carKm >= 0);
      assert.ok(result.equivalencies.smartphoneCharges >= 0);
      assert.ok(result.equivalencies.treeDaysToOffset >= 0);
      assert.ok(result.equivalencies.ledBulbHours >= 0);
    });
  });

  describe('Edge cases', () => {
    it('should handle 1 viewer', () => {
      const result = calculateStreamingFootprint({ ...defaultParams, audienceScale: 1 });

      assert.ok(result.carbon.totalGrams >= 0);
      assert.ok(result.dataTransfer.perViewerGB > 0);
    });

    it('should handle large audience (100 million)', () => {
      const result = calculateStreamingFootprint({ ...defaultParams, audienceScale: 100_000_000 });

      assert.ok(result.carbon.totalKg > 0);
      assert.ok(result.dataTransfer.totalTB > 0);
    });

    it('should handle minimum duration (1 minute)', () => {
      const result = calculateStreamingFootprint({ ...defaultParams, durationMinutes: 1 });

      assert.ok(result.carbon.totalGrams >= 0);
    });

    it('should handle maximum duration (600 minutes)', () => {
      const result = calculateStreamingFootprint({ ...defaultParams, durationMinutes: 600 });

      assert.ok(result.carbon.totalGrams > 0);
    });

    it('should handle 480p resolution', () => {
      const result = calculateStreamingFootprint({ ...defaultParams, resolution: '480p' });

      assert.ok(result.carbon.totalGrams >= 0);
    });

    it('should default to h264 codec multiplier for unknown codec', () => {
      const result = calculateStreamingFootprint({ ...defaultParams, codec: 'unknown' });

      // Should still produce valid results using default multiplier
      assert.ok(result.carbon.totalGrams >= 0);
    });
  });
});
