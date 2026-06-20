/**
 * Media Service — Calculates streaming data footprints and carbon emissions
 * for content delivery at scale based on resolution, duration, audience, and codec.
 */

const {
  STREAMING_RATES_GB_PER_HOUR,
  CODEC_EFFICIENCY,
  NETWORK_ENERGY_KWH_PER_GB,
  GRID_INTENSITY,
  PUE,
  EQUIVALENCIES,
} = require('../utils/carbon-constants');

/**
 * Calculate the total streaming data footprint and carbon emissions.
 *
 * @param {Object} params
 * @param {number} params.durationMinutes - Video duration in minutes
 * @param {string} params.resolution - '4k' | '1080p' | '720p' | '480p'
 * @param {number} params.audienceScale - Number of viewers
 * @param {string} params.codec - 'h264' | 'h265' | 'vp9' | 'av1'
 * @returns {Object} Detailed carbon footprint breakdown
 */
function calculateStreamingFootprint({ durationMinutes, resolution, audienceScale, codec = 'h264' }) {
  const durationHours = durationMinutes / 60;

  // ── Data Transfer per Viewer ──────────────────────────
  const baseRateGBPerHour = STREAMING_RATES_GB_PER_HOUR[resolution] || 2.1;
  const codecMultiplier = CODEC_EFFICIENCY[codec] || 1.0;
  const dataPerViewerGB = baseRateGBPerHour * durationHours * codecMultiplier;

  // ── Total Network Transfer ────────────────────────────
  const totalDataGB = dataPerViewerGB * audienceScale;
  const totalDataTB = totalDataGB / 1024;

  // ── Energy Consumption ────────────────────────────────
  const networkEnergyKWh = totalDataGB * NETWORK_ENERGY_KWH_PER_GB;
  const dataCenterEnergyKWh = networkEnergyKWh * PUE.hyperscale;
  const totalEnergyKWh = networkEnergyKWh + dataCenterEnergyKWh;

  // ── Carbon Emissions ──────────────────────────────────
  const carbonGrams = totalEnergyKWh * GRID_INTENSITY.global_average;
  const carbonKg = carbonGrams / 1000;

  // ── Codec Comparison ──────────────────────────────────
  // Calculate what emissions would be with each codec
  const codecComparison = {};
  for (const [codecName, efficiency] of Object.entries(CODEC_EFFICIENCY)) {
    const altDataGB = baseRateGBPerHour * durationHours * efficiency * audienceScale;
    const altEnergyKWh = altDataGB * NETWORK_ENERGY_KWH_PER_GB * (1 + PUE.hyperscale);
    const altCarbonGrams = altEnergyKWh * GRID_INTENSITY.global_average;
    codecComparison[codecName] = {
      totalDataTB: altDataGB / 1024,
      carbonKg: altCarbonGrams / 1000,
      savingsPercent: codecName === codec ? 0 :
        Math.round((1 - efficiency / codecMultiplier) * 100),
    };
  }

  // ── Resolution Comparison ─────────────────────────────
  const resolutionComparison = {};
  for (const [res, rate] of Object.entries(STREAMING_RATES_GB_PER_HOUR)) {
    const altDataGB = rate * durationHours * codecMultiplier * audienceScale;
    const altEnergyKWh = altDataGB * NETWORK_ENERGY_KWH_PER_GB * (1 + PUE.hyperscale);
    const altCarbonGrams = altEnergyKWh * GRID_INTENSITY.global_average;
    resolutionComparison[res] = {
      totalDataTB: altDataGB / 1024,
      carbonKg: altCarbonGrams / 1000,
    };
  }

  // ── Equivalencies ─────────────────────────────────────
  const equivalencies = {
    carKm: Math.round(carbonGrams * EQUIVALENCIES.car_km_per_g),
    smartphoneCharges: Math.round(carbonGrams * EQUIVALENCIES.smartphone_charges_per_g),
    treeDaysToOffset: Math.round((carbonGrams / EQUIVALENCIES.tree_absorption_g_per_year) * 365),
    ledBulbHours: Math.round(carbonGrams * EQUIVALENCIES.led_bulb_hours_per_g),
  };

  return {
    input: { durationMinutes, resolution, audienceScale, codec },
    dataTransfer: {
      perViewerGB: Math.round(dataPerViewerGB * 100) / 100,
      totalGB: Math.round(totalDataGB * 100) / 100,
      totalTB: Math.round(totalDataTB * 100) / 100,
    },
    energy: {
      networkKWh: Math.round(networkEnergyKWh * 100) / 100,
      dataCenterKWh: Math.round(dataCenterEnergyKWh * 100) / 100,
      totalKWh: Math.round(totalEnergyKWh * 100) / 100,
    },
    carbon: {
      totalGrams: Math.round(carbonGrams),
      totalKg: Math.round(carbonKg * 100) / 100,
    },
    equivalencies,
    codecComparison,
    resolutionComparison,
  };
}

module.exports = {
  calculateStreamingFootprint,
};
