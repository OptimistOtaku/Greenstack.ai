/**
 * Creator Workspace Component - media streaming carbon analysis inputs.
 */

const CreatorWorkspace = {
  render() {
    return `
      <section class="gs-workspace" id="gs-creator-workspace">
        <div class="gs-workspace-header">
          <div class="gs-workspace-breadcrumb">
            <a href="#home">Home</a>
            <span>›</span>
            <span>Creator Workspace</span>
          </div>
          <h1 class="gs-workspace-title">Media Streaming Audit</h1>
          <p class="gs-workspace-subtitle">
            Model the carbon footprint of video delivery across codec choice, resolution, CDN transfer, and audience scale.
          </p>
        </div>

        <div class="gs-workspace-grid">
          <aside class="gs-workspace-brief">
            <span class="gs-panel-label">Agent scope</span>
            <h2>Distribution math for content teams.</h2>
            <p>The streaming agent turns duration, codec, and audience vectors into transfer estimates, then compares modern containers against legacy bitstreams.</p>
            <div class="gs-scope-list">
              <span>Resolution</span>
              <span>Codec</span>
              <span>Audience scale</span>
            </div>
          </aside>

          <div class="gs-input-card" id="creator-input-card">
            <h2 class="gs-input-card-title">Video Parameters</h2>

            <div class="gs-input-group">
              <label class="gs-input-label" for="creator-video-url">Video URL (optional)</label>
              <input
                type="url"
                id="creator-video-url"
                class="gs-input"
                placeholder="https://youtube.com/watch?v=..."
                autocomplete="off"
              >
              <p class="gs-input-hint">Optional, used for reference tracking only.</p>
            </div>

            <div class="gs-form-grid">
              <div class="gs-input-group">
                <label class="gs-input-label" for="creator-duration">Video Duration (minutes)</label>
                <input
                  type="number"
                  id="creator-duration"
                  class="gs-input"
                  placeholder="10"
                  min="1"
                  max="600"
                  value="10"
                >
              </div>

              <div class="gs-input-group">
                <label class="gs-input-label" for="creator-resolution">Resolution</label>
                <select id="creator-resolution" class="gs-select">
                  <option value="4k">4K UHD (7.2 GB/hr)</option>
                  <option value="1080p" selected>1080p HD (2.1 GB/hr)</option>
                  <option value="720p">720p (1.1 GB/hr)</option>
                  <option value="480p">480p SD (0.56 GB/hr)</option>
                </select>
              </div>
            </div>

            <div class="gs-input-group">
              <label class="gs-input-label" for="creator-codec">Video Codec</label>
              <select id="creator-codec" class="gs-select">
                <option value="h264" selected>H.264 (AVC), most common</option>
                <option value="h265">H.265 (HEVC), about 50% better</option>
                <option value="vp9">VP9, YouTube default</option>
                <option value="av1">AV1, most efficient</option>
              </select>
            </div>

            <div class="gs-input-group">
              <label class="gs-input-label" for="creator-audience">Target Audience Scale</label>
              <div class="gs-range-container">
                <span class="gs-range-value" id="creator-audience-display">100,000</span>
                <input
                  type="range"
                  id="creator-audience"
                  class="gs-range"
                  min="1000"
                  max="100000000"
                  value="100000"
                  step="1000"
                >
                <div class="gs-range-labels">
                  <span>1K</span>
                  <span>100M</span>
                </div>
              </div>
            </div>

            <div class="gs-action-row">
              <button
                id="creator-analyze-btn"
                class="gs-btn gs-btn-primary gs-btn-full"
              >
                <span class="gs-btn-text">Calculate Carbon Footprint</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  init() {
    const audienceSlider = document.getElementById('creator-audience');
    const audienceDisplay = document.getElementById('creator-audience-display');
    const analyzeBtn = document.getElementById('creator-analyze-btn');

    if (!audienceSlider || !analyzeBtn) return;

    // Format audience number
    function formatAudience(val) {
      const num = Number(val);
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
      return num.toLocaleString();
    }

    // Use logarithmic scale for the slider
    audienceSlider.addEventListener('input', () => {
      audienceDisplay.textContent = formatAudience(audienceSlider.value);
    });

    // Analyze button
    analyzeBtn.addEventListener('click', async () => {
      const videoUrl = document.getElementById('creator-video-url')?.value.trim() || '';
      const durationMinutes = Number(document.getElementById('creator-duration')?.value || 10);
      const resolution = document.getElementById('creator-resolution')?.value || '1080p';
      const codec = document.getElementById('creator-codec')?.value || 'h264';
      const audienceScale = Number(audienceSlider.value);

      if (durationMinutes <= 0) {
        alert('Please enter a valid video duration.');
        return;
      }

      // Store for results page
      App.state.lastAnalysisType = 'media';
      App.state.lastInput = { videoUrl, durationMinutes, resolution, audienceScale, codec };

      // Navigate to results
      window.location.hash = '#results';
    });
  },
};
