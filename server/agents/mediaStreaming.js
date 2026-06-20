/**
 * Agent 3: Media Network Streaming Agent
 *
 * Content Delivery Network (CDN) & Grid Intensity Auditor.
 * Quantifies ambient carbon emissions triggered by digital asset distribution at scale.
 */

const { generateStructuredResponse, isGeminiAvailable } = require('../utils/gemini-client');
const { calculateStreamingFootprint } = require('../services/media.service');

const SYSTEM_PROMPT = `You are the Media Network Streaming Agent for GreenStack.ai.
Your role is to analyze the carbon footprint of video content distribution at scale across global CDNs.

You will receive pre-computed streaming metrics. Your job is to:
1. Provide context and interpretation of the numbers
2. Compare the environmental impact across different codecs and resolutions
3. Identify the biggest emission reduction opportunities
4. Provide industry context (how this compares to typical streaming footprints)

You MUST respond with valid JSON matching this schema:

{
  "summary": {
    "headline": "<one-line impact statement>",
    "severity": "<critical|warning|moderate|good|excellent>",
    "impactStatement": "<2-3 sentence context about what these emissions mean>"
  },
  "insights": [
    {
      "type": "<efficiency|comparison|recommendation|context>",
      "title": "<string>",
      "description": "<string>",
      "metric": "<optional number or percentage>"
    }
  ],
  "primaryRecommendation": {
    "action": "<string>",
    "estimatedSavingsPercent": <number>,
    "explanation": "<string>"
  },
  "industryContext": {
    "comparison": "<how this compares to industry averages>",
    "trend": "<relevant industry trend>"
  }
}

Guidelines:
- Be data-driven. Reference the actual numbers provided.
- Put carbon numbers in relatable terms (car trips, flights, tree absorption).
- AV1 codec is always the most efficient recommendation if not already used.
- Adaptive bitrate streaming is always worth mentioning as it reduces average data transfer.
- Consider CDN edge caching as a positive factor for repeat viewers.`;

/**
 * Run the Media Streaming analysis on video parameters.
 */
async function analyzeMediaStreaming(params) {
  // ── Compute local metrics first ───────────────────────
  const footprint = calculateStreamingFootprint(params);

  // ── Call Gemini for contextual analysis ────────────────
  let aiAnalysis = null;
  if (isGeminiAvailable()) {
    const contextPayload = buildMediaContext(params, footprint);
    aiAnalysis = await generateStructuredResponse(SYSTEM_PROMPT, contextPayload);
  }

  if (aiAnalysis) {
    return {
      footprint,
      aiAnalysis,
    };
  }

  // ── Fallback without AI ───────────────────────────────
  return {
    footprint,
    aiAnalysis: buildFallbackMediaAnalysis(params, footprint),
  };
}

function buildMediaContext(params, footprint) {
  return `Analyze the following streaming media carbon footprint:

## Input Parameters
- Video Duration: ${params.durationMinutes} minutes
- Resolution: ${params.resolution}
- Audience Scale: ${params.audienceScale.toLocaleString()} viewers
- Codec: ${params.codec}

## Pre-computed Metrics
${JSON.stringify(footprint, null, 2)}

Provide your analysis with insights, recommendations, and industry context.`;
}

function buildFallbackMediaAnalysis(params, footprint) {
  const { carbon, codecComparison } = footprint;
  const insights = [];

  // Best codec recommendation
  const bestCodec = Object.entries(codecComparison)
    .sort((a, b) => a[1].carbonKg - b[1].carbonKg)[0];

  if (bestCodec[0] !== params.codec) {
    const savingsPercent = Math.round(
      (1 - bestCodec[1].carbonKg / carbon.totalKg) * 100
    );
    insights.push({
      type: 'recommendation',
      title: `Switch to ${bestCodec[0].toUpperCase()} codec`,
      description: `Switching from ${params.codec.toUpperCase()} to ${bestCodec[0].toUpperCase()} would reduce emissions by approximately ${savingsPercent}%.`,
      metric: `${savingsPercent}% reduction`,
    });
  }

  // Resolution insight
  if (params.resolution === '4k') {
    insights.push({
      type: 'efficiency',
      title: '4K resolution drives high data transfer',
      description: `4K UHD streaming uses 3.4× more bandwidth than 1080p. Consider offering adaptive bitrate streaming to serve lower resolutions when 4K isn\'t needed.`,
      metric: '3.4× bandwidth vs 1080p',
    });
  }

  // Scale insight
  if (params.audienceScale > 100000) {
    insights.push({
      type: 'context',
      title: 'Large audience amplifies impact',
      description: `At ${params.audienceScale.toLocaleString()} viewers, even small per-viewer optimizations compound into significant carbon savings.`,
    });
  }

  return {
    summary: {
      headline: `${carbon.totalKg} kg CO₂e estimated for ${params.audienceScale.toLocaleString()} viewers`,
      severity: carbon.totalKg > 1000 ? 'critical' : carbon.totalKg > 100 ? 'warning' : carbon.totalKg > 10 ? 'moderate' : 'good',
      impactStatement: `Streaming this ${params.durationMinutes}-minute video at ${params.resolution} to ${params.audienceScale.toLocaleString()} viewers generates approximately ${carbon.totalKg} kg of CO₂e — equivalent to driving ${footprint.equivalencies.carKm} km by car.`,
    },
    insights,
    primaryRecommendation: bestCodec[0] !== params.codec ? {
      action: `Transcode to ${bestCodec[0].toUpperCase()} codec`,
      estimatedSavingsPercent: Math.round((1 - bestCodec[1].carbonKg / carbon.totalKg) * 100),
      explanation: `${bestCodec[0].toUpperCase()} offers the best compression efficiency, reducing data transfer and CDN energy consumption.`,
    } : {
      action: 'Already using most efficient codec',
      estimatedSavingsPercent: 0,
      explanation: 'Consider adaptive bitrate streaming to further reduce average data transfer.',
    },
    note: 'AI-powered deep analysis unavailable — configure GEMINI_API_KEY for richer insights.',
  };
}

module.exports = { analyzeMediaStreaming };
