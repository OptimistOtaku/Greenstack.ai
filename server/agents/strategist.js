/**
 * Agent 4: Mitigation Strategist Agent
 *
 * Refactoring & Action-Plan Generator.
 * Converts carbon metric numbers into direct, executable engineering tasks
 * with syntactically valid code blocks.
 */

const { generateStructuredResponse, isGeminiAvailable } = require('../utils/gemini-client');

const DEV_SYSTEM_PROMPT = `You are the Mitigation Strategist Agent for GreenStack.ai — Developer Infrastructure mode.
Your job is to take carbon analysis results and generate CONCRETE, EXECUTABLE code fixes.

You MUST respond with valid JSON matching this schema:

{
  "strategies": [
    {
      "title": "<action title>",
      "category": "<dockerfile|dependencies|ci|general>",
      "priority": "<critical|high|medium|low>",
      "estimatedSavingsPercent": <number 0-100>,
      "description": "<why this matters>",
      "codeBlock": {
        "language": "<dockerfile|yaml|json|bash|text>",
        "filename": "<suggested filename>",
        "code": "<complete, syntactically valid code>"
      }
    }
  ],
  "totalEstimatedSavingsPercent": <number>,
  "implementationOrder": ["<title1>", "<title2>"],
  "quickWins": ["<immediate actions that take < 5 minutes>"]
}

Rules:
- Generate COMPLETE, ready-to-use code — not snippets or pseudocode.
- For Dockerfiles: always generate full multi-stage build files.
- For CI: generate complete GitHub Actions workflow files with proper caching.
- For dependencies: suggest exact npm commands to run.
- Order strategies by impact (highest savings first).
- Quick wins should be things a developer can do in under 5 minutes.`;

const MEDIA_SYSTEM_PROMPT = `You are the Mitigation Strategist Agent for GreenStack.ai — Media Streaming mode.
Your job is to take media carbon analysis results and generate CONCRETE optimization recommendations.

You MUST respond with valid JSON matching this schema:

{
  "strategies": [
    {
      "title": "<action title>",
      "category": "<codec|resolution|delivery|encoding>",
      "priority": "<critical|high|medium|low>",
      "estimatedSavingsPercent": <number 0-100>,
      "description": "<why this matters>",
      "codeBlock": {
        "language": "<bash|yaml|json|text>",
        "filename": "<suggested filename or command>",
        "code": "<ffmpeg command, config, or instructions>"
      }
    }
  ],
  "totalEstimatedSavingsPercent": <number>,
  "implementationOrder": ["<title1>", "<title2>"],
  "quickWins": ["<immediate actions>"]
}

Rules:
- Generate real ffmpeg commands for codec transcoding.
- Include adaptive bitrate streaming configs (HLS/DASH manifests).
- Suggest specific encoding presets and CRF values.
- Consider CDN caching and edge delivery optimizations.
- Quick wins should be immediately actionable.`;

/**
 * Generate mitigation strategies for developer infrastructure analysis.
 */
async function generateDevStrategies(analysisResult) {
  if (isGeminiAvailable()) {
    const context = `Generate mitigation strategies for the following carbon analysis:\n\n${JSON.stringify(analysisResult, null, 2)}`;
    const aiResult = await generateStructuredResponse(DEV_SYSTEM_PROMPT, context);
    if (aiResult) return aiResult;
  }

  return buildFallbackDevStrategies(analysisResult);
}

/**
 * Generate mitigation strategies for media streaming analysis.
 */
async function generateMediaStrategies(analysisResult) {
  if (isGeminiAvailable()) {
    const context = `Generate mitigation strategies for the following media carbon analysis:\n\n${JSON.stringify(analysisResult, null, 2)}`;
    const aiResult = await generateStructuredResponse(MEDIA_SYSTEM_PROMPT, context);
    if (aiResult) return aiResult;
  }

  return buildFallbackMediaStrategies(analysisResult);
}

// ── Fallback strategies when Gemini is unavailable ──────

function buildFallbackDevStrategies(analysis) {
  const strategies = [];

  // Always recommend multi-stage Docker builds
  if (analysis?.dockerAnalysis?.hasMultiStage === false || analysis?.localMetrics?.hasMultiStage === false) {
    strategies.push({
      title: 'Optimize Dockerfile with Multi-Stage Build',
      category: 'dockerfile',
      priority: 'high',
      estimatedSavingsPercent: 60,
      description: 'Multi-stage builds separate build dependencies from the production image, reducing image size by 60-80%.',
      codeBlock: {
        language: 'dockerfile',
        filename: 'Dockerfile',
        code: `# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .
EXPOSE 8080
CMD ["node", "server/index.js"]`,
      },
    });
  }

  // CI caching
  const hasCaching = analysis?.ciAnalysis?.hasCaching ?? analysis?.localMetrics?.hasCaching;
  if (hasCaching === false) {
    strategies.push({
      title: 'Add Dependency Caching to GitHub Actions',
      category: 'ci',
      priority: 'critical',
      estimatedSavingsPercent: 45,
      description: 'Caching node_modules between CI runs eliminates redundant npm installs, reducing runner time by 40-60%.',
      codeBlock: {
        language: 'yaml',
        filename: '.github/workflows/ci.yml',
        code: `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build`,
      },
    });
  }

  // Lightweight base image
  strategies.push({
    title: 'Use Alpine-based Node.js Image',
    category: 'dockerfile',
    priority: 'medium',
    estimatedSavingsPercent: 25,
    description: 'Alpine images are ~50MB vs ~350MB for full Node.js images, reducing pull/push energy by 85%.',
    codeBlock: {
      language: 'dockerfile',
      filename: 'Dockerfile',
      code: '# Replace: FROM node:20\n# With:\nFROM node:20-alpine',
    },
  });

  return {
    strategies,
    totalEstimatedSavingsPercent: strategies.reduce((sum, s) => sum + s.estimatedSavingsPercent, 0),
    implementationOrder: strategies.map((s) => s.title),
    quickWins: [
      'Add .dockerignore file to exclude node_modules and .git',
      'Pin dependency versions in package.json (remove ^ and ~)',
      'Add "cache: npm" to actions/setup-node step',
    ],
    note: 'AI-powered strategies unavailable — configure GEMINI_API_KEY for tailored code recommendations.',
  };
}

function buildFallbackMediaStrategies(analysis) {
  const footprint = analysis?.footprint;
  const codec = footprint?.input?.codec || 'h264';
  const strategies = [];

  if (codec !== 'av1') {
    strategies.push({
      title: 'Transcode to AV1 Codec',
      category: 'codec',
      priority: 'critical',
      estimatedSavingsPercent: 65,
      description: 'AV1 achieves ~65% better compression than H.264 at equivalent quality, dramatically reducing CDN data transfer.',
      codeBlock: {
        language: 'bash',
        filename: 'transcode-av1.sh',
        code: `# Transcode to AV1 using ffmpeg with SVT-AV1 encoder
ffmpeg -i input.mp4 \\
  -c:v libsvtav1 \\
  -crf 30 \\
  -preset 6 \\
  -c:a libopus \\
  -b:a 128k \\
  -movflags +faststart \\
  output_av1.mp4`,
      },
    });
  }

  strategies.push({
    title: 'Implement Adaptive Bitrate Streaming (HLS)',
    category: 'delivery',
    priority: 'high',
    estimatedSavingsPercent: 30,
    description: 'Adaptive bitrate streaming serves the optimal resolution for each viewer\'s bandwidth, avoiding unnecessary 4K delivery to mobile viewers.',
    codeBlock: {
      language: 'bash',
      filename: 'generate-hls.sh',
      code: `# Generate multi-resolution HLS playlist
ffmpeg -i input.mp4 \\
  -filter_complex "[0:v]split=3[v1][v2][v3]; \\
    [v1]scale=1920:1080[v1out]; \\
    [v2]scale=1280:720[v2out]; \\
    [v3]scale=854:480[v3out]" \\
  -map "[v1out]" -c:v:0 libx264 -b:v:0 5M \\
  -map "[v2out]" -c:v:1 libx264 -b:v:1 3M \\
  -map "[v3out]" -c:v:2 libx264 -b:v:2 1M \\
  -map 0:a -c:a aac -b:a 128k \\
  -f hls -hls_time 6 \\
  -hls_playlist_type vod \\
  -master_pl_name master.m3u8 \\
  output_%v.m3u8`,
    },
  });

  return {
    strategies,
    totalEstimatedSavingsPercent: strategies.reduce((sum, s) => sum + s.estimatedSavingsPercent, 0),
    implementationOrder: strategies.map((s) => s.title),
    quickWins: [
      'Enable gzip/brotli compression on your CDN',
      'Set aggressive Cache-Control headers for video segments',
      'Use -movflags +faststart for progressive download',
    ],
    note: 'AI-powered strategies unavailable — configure GEMINI_API_KEY for tailored recommendations.',
  };
}

module.exports = { generateDevStrategies, generateMediaStrategies };
