/**
 * API Client - Fetch wrapper for GreenStack.ai backend endpoints.
 */

const API = {
  BASE: '',

  /**
   * Analyze a GitHub repository for carbon inefficiencies.
   */
  async analyzeRepo(repoUrl) {
    const res = await fetch(`${this.BASE}/api/analyze/repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || err.error || `Server error: ${res.status}`);
    }

    return res.json();
  },

  /**
   * Analyze media streaming carbon footprint.
   */
  async analyzeMedia({ videoUrl, durationMinutes, resolution, audienceScale, codec }) {
    const res = await fetch(`${this.BASE}/api/analyze/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl, durationMinutes, resolution, audienceScale, codec }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || err.error || `Server error: ${res.status}`);
    }

    return res.json();
  },

  /**
   * Health check.
   */
  async health() {
    const res = await fetch(`${this.BASE}/api/health`);
    return res.json();
  },
};
