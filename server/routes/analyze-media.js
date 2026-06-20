const express = require('express');
const router = express.Router();
const { orchestrateMediaAnalysis } = require('../agents/orchestrator');
const { logAuditEvent } = require('../services/bigquery.service');

/**
 * POST /api/analyze/media
 * Accepts video metadata (duration, resolution, audience scale) and runs
 * the multi-agent carbon analysis pipeline for streaming media.
 */
router.post('/media', async (req, res) => {
  try {
    const { videoUrl, durationMinutes, resolution, audienceScale, codec } = req.body;

    // Validate required fields
    if (durationMinutes === undefined || !resolution || audienceScale === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: durationMinutes, resolution, audienceScale',
      });
    }

    // Validate numeric types
    const parsedDuration = Number(durationMinutes);
    const parsedAudience = Number(audienceScale);

    if (!Number.isFinite(parsedDuration) || !Number.isFinite(parsedAudience)) {
      return res.status(400).json({
        error: 'durationMinutes and audienceScale must be valid numbers',
      });
    }

    // Validate numeric ranges
    if (parsedDuration <= 0 || parsedDuration > 600) {
      return res.status(400).json({
        error: 'durationMinutes must be between 1 and 600',
      });
    }

    if (parsedAudience <= 0 || parsedAudience > 10_000_000_000) {
      return res.status(400).json({
        error: 'audienceScale must be between 1 and 10,000,000,000',
      });
    }

    // Validate resolution
    const validResolutions = ['4k', '1080p', '720p', '480p'];
    const normalizedResolution = String(resolution).toLowerCase();
    if (!validResolutions.includes(normalizedResolution)) {
      return res.status(400).json({
        error: `Invalid resolution. Valid options: ${validResolutions.join(', ')}`,
      });
    }

    // Validate codec
    const validCodecs = ['h264', 'h265', 'vp9', 'av1'];
    const normalizedCodec = String(codec || 'h264').toLowerCase();
    if (!validCodecs.includes(normalizedCodec)) {
      return res.status(400).json({
        error: `Invalid codec. Valid options: ${validCodecs.join(', ')}`,
      });
    }

    console.log(`🎬 Analyzing media: ${parsedDuration}min @ ${normalizedResolution}, ${parsedAudience} viewers`);

    const result = await orchestrateMediaAnalysis({
      videoUrl: videoUrl || null,
      durationMinutes: parsedDuration,
      resolution: normalizedResolution,
      audienceScale: parsedAudience,
      codec: normalizedCodec,
    });

    const response = {
      success: true,
      analyzedAt: new Date().toISOString(),
      ...result,
    };

    // Stream audit event to BigQuery (non-blocking)
    logAuditEvent('media_analysis', {
      resolution: normalizedResolution,
      codec: normalizedCodec,
      durationMinutes: parsedDuration,
      audienceScale: parsedAudience,
      carbonKg: result.analysis?.footprint?.carbon?.totalKg,
    }).catch(() => { /* non-critical */ });

    res.json(response);
  } catch (error) {
    console.error('❌ Media analysis error:', error.message);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
    });
  }
});

module.exports = router;
