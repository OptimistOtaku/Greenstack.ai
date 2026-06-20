/**
 * Agent 2: Developer GreenOps Architecture Agent
 *
 * Targeted Manifest Static Analyzer & Infrastructure Auditor.
 * Evaluates dependency overhead, build-matrix inefficiencies,
 * and deployment configuration flows without cloning source repositories.
 */

const { generateStructuredResponse, isGeminiAvailable } = require('../utils/gemini-client');
const {
  DOCKER_CONSTANTS,
  DEPENDENCY_CONSTANTS,
  CI_RUNNER_ENERGY,
  GRID_INTENSITY,
  EQUIVALENCIES,
} = require('../utils/carbon-constants');

const SYSTEM_PROMPT = `You are the Developer GreenOps Architecture Agent for GreenStack.ai.
Your role is to analyze developer infrastructure manifests (package.json, Dockerfile, GitHub Actions workflows)
and identify carbon inefficiencies — unnecessary compute, bloated dependencies, and unoptimized build configurations.

You MUST respond with valid JSON matching this exact schema:

{
  "summary": {
    "overallScore": <number 0-100, where 100 is perfectly green>,
    "totalEstimatedCarbonGrams": <number>,
    "severity": "<critical|warning|moderate|good|excellent>",
    "headline": "<one-line summary of findings>"
  },
  "packageAnalysis": {
    "totalDependencies": <number>,
    "totalDevDependencies": <number>,
    "heavyPackages": [{"name": "<string>", "reason": "<string>", "alternative": "<string>"}],
    "unusedRiskPackages": [{"name": "<string>", "reason": "<string>"}],
    "bundleSizeImpact": "<low|medium|high>",
    "findings": [{"severity": "<critical|warning|info>", "title": "<string>", "description": "<string>"}]
  },
  "dockerAnalysis": {
    "baseImage": "<string or null>",
    "estimatedImageSizeMB": <number>,
    "optimizedImageSizeMB": <number>,
    "hasMultiStage": <boolean>,
    "hasDockerignore": <boolean>,
    "layerIssues": [{"severity": "<critical|warning|info>", "title": "<string>", "description": "<string>"}],
    "findings": [{"severity": "<critical|warning|info>", "title": "<string>", "description": "<string>"}]
  },
  "ciAnalysis": {
    "totalWorkflows": <number>,
    "hasCaching": <boolean>,
    "estimatedRunMinutes": <number>,
    "findings": [{"severity": "<critical|warning|info>", "title": "<string>", "description": "<string>"}]
  },
  "allFindings": [{"severity": "<critical|warning|info>", "title": "<string>", "description": "<string>", "source": "<package|docker|ci>"}]
}

Guidelines:
- Be specific and actionable in findings. Name exact packages, exact Dockerfile lines, exact workflow keys.
- Score aggressively: missing cache keys in CI is always a critical finding.
- Heavy packages (webpack, electron, puppeteer, node-sass) deserve warnings if lighter alternatives exist.
- Dockerfile without multi-stage build is a warning. Using :latest tag is a warning.
- Missing .dockerignore is always a warning.
- Estimate carbon using: dependencies × build time × runner energy × grid intensity.
- If a manifest is missing, note it but don't penalize the score — the repo may not use that technology.`;

/**
 * Run the Developer GreenOps analysis on repository manifests.
 */
async function analyzeDevInfrastructure(manifests) {
  const { packageJson, dockerfile, workflows } = manifests;

  // ── Build local metrics first ─────────────────────────
  const localMetrics = buildLocalMetrics(manifests);

  // ── Call Gemini for deep analysis ─────────────────────
  let aiAnalysis = null;
  if (isGeminiAvailable()) {
    const contextPayload = buildContextPayload(manifests, localMetrics);
    aiAnalysis = await generateStructuredResponse(SYSTEM_PROMPT, contextPayload);
  }

  // ── Merge AI analysis with local metrics ──────────────
  if (aiAnalysis) {
    // Enrich with our locally computed energy numbers
    aiAnalysis.localMetrics = localMetrics;
    aiAnalysis.equivalencies = computeEquivalencies(
      aiAnalysis.summary?.totalEstimatedCarbonGrams || localMetrics.estimatedCarbonGrams
    );
    return aiAnalysis;
  }

  // ── Fallback: local-only analysis ─────────────────────
  return buildFallbackAnalysis(manifests, localMetrics);
}

/**
 * Compute local metrics without AI (dependency counting, image sizing, etc.)
 */
function buildLocalMetrics(manifests) {
  const { packageJson, dockerfile, workflows } = manifests;
  const metrics = {
    estimatedCarbonGrams: 0,
    estimatedEnergyKWh: 0,
  };

  // Package analysis
  if (packageJson) {
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    metrics.totalDeps = deps.length;
    metrics.totalDevDeps = devDeps.length;
    metrics.allDeps = [...deps, ...devDeps];

    // Energy from installing dependencies
    const installEnergy = (deps.length + devDeps.length) * DEPENDENCY_CONSTANTS.avg_install_energy_kwh;
    // Energy from building (heavier with more deps)
    const buildEnergy = ((deps.length + devDeps.length) / 100) * DEPENDENCY_CONSTANTS.build_energy_per_100_deps_kwh;

    // Check for heavy packages
    metrics.heavyDeps = metrics.allDeps.filter((d) => DEPENDENCY_CONSTANTS.heavy_packages[d]);
    const heavyBuildSeconds = metrics.heavyDeps.reduce(
      (sum, d) => sum + (DEPENDENCY_CONSTANTS.heavy_packages[d] || 0), 0
    );
    const heavyEnergy = (heavyBuildSeconds / 60) * CI_RUNNER_ENERGY.generic;

    metrics.packageEnergy = installEnergy + buildEnergy + heavyEnergy;
    metrics.estimatedEnergyKWh += metrics.packageEnergy;
  }

  // Docker analysis
  if (dockerfile) {
    const fromMatch = dockerfile.match(/^FROM\s+(\S+)/im);
    metrics.baseImage = fromMatch ? fromMatch[1] : 'unknown';
    metrics.hasMultiStage = (dockerfile.match(/^FROM\s/gim) || []).length > 1;

    // Estimate image size
    const baseSize = DOCKER_CONSTANTS.base_image_sizes[metrics.baseImage.toLowerCase()] || 200;
    metrics.estimatedImageSizeMB = baseSize + (metrics.totalDeps || 0) * 2;

    // Energy from pulling/pushing images
    const pullPushEnergy = (metrics.estimatedImageSizeMB / 1024) * DOCKER_CONSTANTS.pull_energy_kwh_per_gb * 2;
    metrics.dockerEnergy = pullPushEnergy;
    metrics.estimatedEnergyKWh += metrics.dockerEnergy;
  }

  // CI analysis
  if (workflows && Object.keys(workflows).length > 0) {
    metrics.workflowCount = Object.keys(workflows).length;
    const allWorkflowText = Object.values(workflows).join('\n');
    metrics.hasCaching = /cache/i.test(allWorkflowText);
    metrics.hasMatrix = /matrix/i.test(allWorkflowText);

    // Estimate CI runtime energy
    const estimatedRunMinutes = metrics.workflowCount * 5 * (metrics.hasMatrix ? 3 : 1);
    const ciEnergy = estimatedRunMinutes * CI_RUNNER_ENERGY.github_actions_linux;
    metrics.ciEnergy = ciEnergy;
    metrics.estimatedRunMinutes = estimatedRunMinutes;
    metrics.estimatedEnergyKWh += ciEnergy;
  }

  metrics.estimatedCarbonGrams = Math.round(metrics.estimatedEnergyKWh * GRID_INTENSITY.global_average);
  return metrics;
}

function buildContextPayload(manifests, localMetrics) {
  const sections = ['Analyze the following repository manifests for carbon inefficiencies:\n'];

  if (manifests.packageJson) {
    sections.push(`## package.json\n\`\`\`json\n${JSON.stringify(manifests.packageJson, null, 2)}\n\`\`\`\n`);
  } else {
    sections.push('## package.json\nNot found in repository.\n');
  }

  if (manifests.dockerfile) {
    sections.push(`## Dockerfile\n\`\`\`dockerfile\n${manifests.dockerfile}\n\`\`\`\n`);
  } else {
    sections.push('## Dockerfile\nNot found in repository.\n');
  }

  if (manifests.workflows && Object.keys(manifests.workflows).length > 0) {
    for (const [name, content] of Object.entries(manifests.workflows)) {
      sections.push(`## Workflow: ${name}\n\`\`\`yaml\n${content}\n\`\`\`\n`);
    }
  } else {
    sections.push('## GitHub Actions Workflows\nNo workflows found.\n');
  }

  sections.push(`## Local Metrics (pre-computed)\n\`\`\`json\n${JSON.stringify(localMetrics, null, 2)}\n\`\`\``);

  return sections.join('\n');
}

function computeEquivalencies(carbonGrams) {
  return {
    carKm: Math.round(carbonGrams * EQUIVALENCIES.car_km_per_g),
    smartphoneCharges: Math.round(carbonGrams * EQUIVALENCIES.smartphone_charges_per_g),
    treeDaysToOffset: Math.round((carbonGrams / EQUIVALENCIES.tree_absorption_g_per_year) * 365),
    ledBulbHours: Math.round(carbonGrams * EQUIVALENCIES.led_bulb_hours_per_g),
  };
}

function buildFallbackAnalysis(manifests, localMetrics) {
  const findings = [];

  if (localMetrics.heavyDeps?.length > 0) {
    findings.push({
      severity: 'warning',
      title: 'Heavy dependencies detected',
      description: `Found ${localMetrics.heavyDeps.length} heavy package(s): ${localMetrics.heavyDeps.join(', ')}. These significantly increase build times and energy consumption.`,
      source: 'package',
    });
  }

  if (manifests.dockerfile && !localMetrics.hasMultiStage) {
    findings.push({
      severity: 'warning',
      title: 'No multi-stage Docker build',
      description: 'Using a single-stage Dockerfile includes build tools in the production image, increasing size and pull energy.',
      source: 'docker',
    });
  }

  if (localMetrics.workflowCount > 0 && !localMetrics.hasCaching) {
    findings.push({
      severity: 'critical',
      title: 'No CI caching detected',
      description: 'GitHub Actions workflows do not appear to use caching. Adding dependency caching can reduce CI energy by 40-60%.',
      source: 'ci',
    });
  }

  const score = Math.max(0, 100 - findings.length * 20);

  return {
    summary: {
      overallScore: score,
      totalEstimatedCarbonGrams: localMetrics.estimatedCarbonGrams,
      severity: score >= 80 ? 'good' : score >= 50 ? 'moderate' : 'warning',
      headline: `Found ${findings.length} carbon optimization opportunity(ies) across your infrastructure.`,
    },
    allFindings: findings,
    localMetrics,
    equivalencies: computeEquivalencies(localMetrics.estimatedCarbonGrams),
    note: 'AI-powered deep analysis unavailable — configure GEMINI_API_KEY for detailed recommendations.',
  };
}

module.exports = { analyzeDevInfrastructure };
