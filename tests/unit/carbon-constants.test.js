/**
 * Unit Tests — Carbon Constants
 * Validates that all carbon calculation constants are within expected ranges.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  GRID_INTENSITY,
  PUE,
  STREAMING_RATES_GB_PER_HOUR,
  CODEC_EFFICIENCY,
  NETWORK_ENERGY_KWH_PER_GB,
  CI_RUNNER_ENERGY,
  DOCKER_CONSTANTS,
  DEPENDENCY_CONSTANTS,
  EQUIVALENCIES,
} = require('../../server/utils/carbon-constants');

describe('Carbon Constants', () => {
  describe('GRID_INTENSITY', () => {
    it('should have a global_average value', () => {
      assert.ok(GRID_INTENSITY.global_average > 0);
    });

    it('should have all values as positive numbers', () => {
      for (const [region, intensity] of Object.entries(GRID_INTENSITY)) {
        assert.ok(typeof intensity === 'number', `${region} should be a number`);
        assert.ok(intensity > 0, `${region} should be positive`);
        assert.ok(intensity < 2000, `${region} should be below 2000 gCO₂e/kWh`);
      }
    });

    it('should have Nordic region lower than global average (hydro/wind)', () => {
      assert.ok(GRID_INTENSITY.eu_north < GRID_INTENSITY.global_average);
    });
  });

  describe('PUE', () => {
    it('should have all PUE values between 1.0 and 3.0', () => {
      for (const [type, pue] of Object.entries(PUE)) {
        assert.ok(pue >= 1.0, `${type} PUE must be >= 1.0`);
        assert.ok(pue <= 3.0, `${type} PUE must be <= 3.0`);
      }
    });

    it('should have hyperscale lower than enterprise (more efficient)', () => {
      assert.ok(PUE.hyperscale < PUE.enterprise);
    });
  });

  describe('STREAMING_RATES_GB_PER_HOUR', () => {
    it('should have 4K higher than 1080p', () => {
      assert.ok(STREAMING_RATES_GB_PER_HOUR['4k'] > STREAMING_RATES_GB_PER_HOUR['1080p']);
    });

    it('should have all values as positive numbers', () => {
      for (const [res, rate] of Object.entries(STREAMING_RATES_GB_PER_HOUR)) {
        assert.ok(typeof rate === 'number', `${res} should be a number`);
        assert.ok(rate > 0, `${res} should be positive`);
      }
    });

    it('should have rates in descending order (4K > 1080p > 720p > 480p)', () => {
      assert.ok(STREAMING_RATES_GB_PER_HOUR['4k'] > STREAMING_RATES_GB_PER_HOUR['1080p']);
      assert.ok(STREAMING_RATES_GB_PER_HOUR['1080p'] > STREAMING_RATES_GB_PER_HOUR['720p']);
      assert.ok(STREAMING_RATES_GB_PER_HOUR['720p'] > STREAMING_RATES_GB_PER_HOUR['480p']);
    });
  });

  describe('CODEC_EFFICIENCY', () => {
    it('should have H.264 as baseline (1.0)', () => {
      assert.strictEqual(CODEC_EFFICIENCY.h264, 1.0);
    });

    it('should have AV1 as most efficient (lowest multiplier)', () => {
      const values = Object.values(CODEC_EFFICIENCY);
      const minValue = Math.min(...values);
      assert.strictEqual(CODEC_EFFICIENCY.av1, minValue);
    });

    it('should have all multipliers between 0 and 1', () => {
      for (const [codec, efficiency] of Object.entries(CODEC_EFFICIENCY)) {
        assert.ok(efficiency > 0, `${codec} must be > 0`);
        assert.ok(efficiency <= 1.0, `${codec} must be <= 1.0`);
      }
    });
  });

  describe('NETWORK_ENERGY_KWH_PER_GB', () => {
    it('should be a positive number', () => {
      assert.ok(typeof NETWORK_ENERGY_KWH_PER_GB === 'number');
      assert.ok(NETWORK_ENERGY_KWH_PER_GB > 0);
    });
  });

  describe('CI_RUNNER_ENERGY', () => {
    it('should have all values as positive numbers', () => {
      for (const [runner, energy] of Object.entries(CI_RUNNER_ENERGY)) {
        assert.ok(typeof energy === 'number', `${runner} should be a number`);
        assert.ok(energy > 0, `${runner} should be positive`);
      }
    });
  });

  describe('DOCKER_CONSTANTS', () => {
    it('should have Alpine smaller than full Node images', () => {
      assert.ok(
        DOCKER_CONSTANTS.base_image_sizes['alpine'] <
        DOCKER_CONSTANTS.base_image_sizes['node:latest']
      );
    });

    it('should have pull_energy_kwh_per_gb as a positive number', () => {
      assert.ok(DOCKER_CONSTANTS.pull_energy_kwh_per_gb > 0);
    });
  });

  describe('DEPENDENCY_CONSTANTS', () => {
    it('should have known heavy packages', () => {
      assert.ok(Object.keys(DEPENDENCY_CONSTANTS.heavy_packages).length > 0);
      assert.ok('webpack' in DEPENDENCY_CONSTANTS.heavy_packages);
      assert.ok('electron' in DEPENDENCY_CONSTANTS.heavy_packages);
    });

    it('should have positive energy values', () => {
      assert.ok(DEPENDENCY_CONSTANTS.avg_install_energy_kwh > 0);
      assert.ok(DEPENDENCY_CONSTANTS.build_energy_per_100_deps_kwh > 0);
    });
  });

  describe('EQUIVALENCIES', () => {
    it('should have all equivalency values as positive numbers', () => {
      for (const [name, value] of Object.entries(EQUIVALENCIES)) {
        assert.ok(typeof value === 'number', `${name} should be a number`);
        assert.ok(value > 0, `${name} should be positive`);
      }
    });
  });
});
