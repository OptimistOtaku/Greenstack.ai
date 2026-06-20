/**
 * Carbon Constants — Energy grid coefficients, data rates, and compute baselines
 * used across all GreenStack.ai analysis agents.
 *
 * Sources:
 * - IEA Global Energy Review (grid intensity)
 * - Shift Project Lean ICT Report (network energy)
 * - Cloud Carbon Footprint methodology (compute/storage)
 */

// ── Grid Intensity by Region (gCO₂e per kWh) ──────────────
const GRID_INTENSITY = {
  global_average: 475,
  us_east: 380,
  us_west: 290,
  eu_west: 260,
  eu_north: 30,    // Nordic hydro/wind
  asia_east: 550,
  asia_south: 700,
  oceania: 510,
};

// ── Data Center PUE (Power Usage Effectiveness) ────────────
const PUE = {
  hyperscale: 1.1,    // Google, AWS, Azure top-tier
  enterprise: 1.58,   // Average enterprise data center
  colocation: 1.4,
};

// ── Streaming Data Rates (GB per hour) ─────────────────────
const STREAMING_RATES_GB_PER_HOUR = {
  '4k': 7.2,
  '1080p': 2.1,
  '720p': 1.1,
  '480p': 0.56,
  '360p': 0.32,
};

// ── Codec Efficiency Multipliers (relative to H.264) ───────
// Lower is better — represents data size relative to H.264 baseline
const CODEC_EFFICIENCY = {
  h264: 1.0,
  h265: 0.5,
  vp9: 0.55,
  av1: 0.35,
};

// ── Network Energy (kWh per GB transferred) ────────────────
const NETWORK_ENERGY_KWH_PER_GB = 0.06;

// ── CI/CD Runner Energy Estimates ──────────────────────────
const CI_RUNNER_ENERGY = {
  // kWh per minute of compute
  github_actions_linux: 0.00083,   // ~50W average
  github_actions_windows: 0.00133, // ~80W average
  github_actions_macos: 0.00117,   // ~70W average
  generic: 0.001,
};

// ── Docker Layer Overhead ──────────────────────────────────
const DOCKER_CONSTANTS = {
  // Estimated pull energy per GB of image layer
  pull_energy_kwh_per_gb: 0.06,
  // Average unoptimized image overhead (MB)
  avg_unoptimized_overhead_mb: 450,
  // Alpine vs Ubuntu base image size differential (MB)
  base_image_sizes: {
    'alpine': 5,
    'node:alpine': 50,
    'node:slim': 80,
    'node:latest': 350,
    'node:18': 350,
    'node:20': 370,
    'python:slim': 120,
    'python:latest': 920,
    'ubuntu:latest': 75,
    'ubuntu:22.04': 75,
    'debian:slim': 60,
    'debian:latest': 125,
  },
};

// ── Dependency Overhead Estimates ──────────────────────────
const DEPENDENCY_CONSTANTS = {
  // Average install energy per dependency (kWh)
  avg_install_energy_kwh: 0.0001,
  // Build energy multiplier per 100 dependencies
  build_energy_per_100_deps_kwh: 0.015,
  // Known heavy dependencies (estimated extra build time in seconds)
  heavy_packages: {
    'webpack': 15,
    'typescript': 10,
    'babel': 8,
    'next': 20,
    'react-scripts': 25,
    'electron': 45,
    'puppeteer': 30,
    'sharp': 12,
    'canvas': 15,
    'node-sass': 20,
    'grpc': 25,
  },
};

// ── Carbon Equivalencies ───────────────────────────────────
// Used to translate raw CO₂e (grams) into relatable comparisons
const EQUIVALENCIES = {
  car_km_per_g: 1 / 120,           // Average car emits ~120g CO₂/km
  smartphone_charges_per_g: 1 / 8.22, // ~8.22g CO₂ per full charge
  tree_absorption_g_per_year: 22000,   // One tree absorbs ~22kg CO₂/year
  led_bulb_hours_per_g: 1 / 5,     // ~5g CO₂ per hour of LED bulb
  flights_nyc_london_g: 986000,     // ~986kg CO₂ per passenger
};

module.exports = {
  GRID_INTENSITY,
  PUE,
  STREAMING_RATES_GB_PER_HOUR,
  CODEC_EFFICIENCY,
  NETWORK_ENERGY_KWH_PER_GB,
  CI_RUNNER_ENERGY,
  DOCKER_CONSTANTS,
  DEPENDENCY_CONSTANTS,
  EQUIVALENCIES,
};
