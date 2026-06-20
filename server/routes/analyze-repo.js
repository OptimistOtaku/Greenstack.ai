const express = require('express');
const router = express.Router();
const { orchestrateRepoAnalysis } = require('../agents/orchestrator');
const { logAuditEvent } = require('../services/bigquery.service');

/**
 * POST /api/analyze/repo
 * Accepts a public GitHub repository URL, fetches manifests via GitHub API,
 * and runs the multi-agent carbon analysis pipeline.
 */
router.post('/repo', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ error: 'Missing required field: repoUrl' });
    }

    // Sanitize: trim, strip fragments and query params
    const sanitizedUrl = repoUrl.trim().split('#')[0].split('?')[0].replace(/\/+$/, '');

    // Reject URLs with embedded credentials
    if (sanitizedUrl.includes('@')) {
      return res.status(400).json({
        error: 'Invalid URL: embedded credentials are not allowed.',
      });
    }

    // Validate GitHub URL format
    const githubRegex = /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/;
    const match = sanitizedUrl.match(githubRegex);

    if (!match) {
      return res.status(400).json({
        error: 'Invalid GitHub URL. Expected format: https://github.com/owner/repo',
      });
    }

    const owner = match[1];
    const repo = match[2];

    console.log(`📦 Analyzing repository: ${owner}/${repo}`);

    const result = await orchestrateRepoAnalysis(owner, repo);

    const response = {
      success: true,
      repository: `${owner}/${repo}`,
      analyzedAt: new Date().toISOString(),
      ...result,
    };

    // Stream audit event to BigQuery (non-blocking)
    logAuditEvent('repo_analysis', {
      repository: `${owner}/${repo}`,
      score: result.analysis?.summary?.overallScore,
      carbonGrams: result.analysis?.summary?.totalEstimatedCarbonGrams,
    }).catch(() => { /* non-critical */ });

    res.json(response);
  } catch (error) {
    console.error('❌ Repo analysis error:', error.message);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
    });
  }
});

module.exports = router;
