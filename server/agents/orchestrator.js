/**
 * Agent 1: Unified Input Orchestrator
 *
 * Context Router & Input Validator.
 * Intercepts ingress data streams, normalizes structural signatures,
 * and coordinates the multi-agent analysis pipeline:
 *   Ingest → Analyze (DevGreenOps | MediaStreaming) → Strategize
 */

const { fetchAllManifests } = require('../services/github.service');
const { analyzeDevInfrastructure } = require('./devGreenOps');
const { analyzeMediaStreaming } = require('./mediaStreaming');
const { generateDevStrategies, generateMediaStrategies } = require('./strategist');

/**
 * Orchestrate a full repository carbon analysis.
 * Pipeline: Fetch Manifests → DevGreenOps Agent → Strategist Agent
 *
 * @param {string} owner - GitHub repo owner
 * @param {string} repo - GitHub repo name
 * @returns {Object} Complete analysis with metrics, findings, and mitigation strategies
 */
async function orchestrateRepoAnalysis(owner, repo) {
  console.log(`🔄 [Orchestrator] Starting repo analysis pipeline for ${owner}/${repo}`);

  // ── Step 1: Ingestion — Fetch manifests via GitHub API ──
  console.log('   📥 Step 1: Fetching repository manifests...');
  const repoData = await fetchAllManifests(owner, repo);

  if (!repoData.detected.hasPackageJson && !repoData.detected.hasDockerfile && !repoData.detected.hasWorkflows) {
    return {
      meta: repoData.meta,
      detected: repoData.detected,
      analysis: null,
      strategies: null,
      message: 'No analyzable manifests found (package.json, Dockerfile, or GitHub Actions workflows). This repository may use a different technology stack.',
    };
  }

  // ── Step 2: Analysis — DevGreenOps Agent ────────────────
  console.log('   🔬 Step 2: Running DevGreenOps analysis...');
  const analysis = await analyzeDevInfrastructure(repoData.manifests);

  // ── Step 3: Strategy — Mitigation Strategist Agent ──────
  console.log('   🛠️  Step 3: Generating mitigation strategies...');
  const strategies = await generateDevStrategies(analysis);

  console.log(`✅ [Orchestrator] Repo analysis complete for ${owner}/${repo}`);

  return {
    meta: repoData.meta,
    detected: repoData.detected,
    analysis,
    strategies,
  };
}

/**
 * Orchestrate a full media streaming carbon analysis.
 * Pipeline: Validate Input → MediaStreaming Agent → Strategist Agent
 *
 * @param {Object} params - Media parameters
 * @returns {Object} Complete analysis with footprint, insights, and strategies
 */
async function orchestrateMediaAnalysis(params) {
  console.log(`🔄 [Orchestrator] Starting media analysis pipeline`);

  // ── Step 1: Analysis — Media Streaming Agent ────────────
  console.log('   🎬 Step 1: Computing streaming footprint...');
  const analysis = await analyzeMediaStreaming(params);

  // ── Step 2: Strategy — Mitigation Strategist Agent ──────
  console.log('   🛠️  Step 2: Generating mitigation strategies...');
  const strategies = await generateMediaStrategies(analysis);

  console.log('✅ [Orchestrator] Media analysis complete');

  return {
    analysis,
    strategies,
  };
}

module.exports = {
  orchestrateRepoAnalysis,
  orchestrateMediaAnalysis,
};
