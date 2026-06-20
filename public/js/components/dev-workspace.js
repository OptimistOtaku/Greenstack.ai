/**
 * Developer Workspace Component - GitHub URL input and repo analysis.
 */

const DevWorkspace = {
  render() {
    return `
      <section class="gs-workspace" id="gs-dev-workspace">
        <div class="gs-workspace-header">
          <div class="gs-workspace-breadcrumb">
            <a href="#home">Home</a>
            <span>›</span>
            <span>Developer Workspace</span>
          </div>
          <h1 class="gs-workspace-title">Developer GreenOps Audit</h1>
          <p class="gs-workspace-subtitle">
            Paste a public GitHub repository URL and route its manifests through the GreenOps architecture agent.
          </p>
        </div>

        <div class="gs-workspace-grid">
          <aside class="gs-workspace-brief">
            <span class="gs-panel-label">Agent scope</span>
            <h2>Static analysis without repository checkout.</h2>
            <p>The agent looks for dependency overhead, layer hygiene, and workflow cache misses, then hands findings to the mitigation strategist.</p>
            <div class="gs-scope-list">
              <span>package.json</span>
              <span>Dockerfile</span>
              <span>GitHub Actions</span>
            </div>
          </aside>

          <div class="gs-input-card" id="dev-input-card">
            <h2 class="gs-input-card-title">Repository URL</h2>
            <div class="gs-input-group">
              <label class="gs-input-label" for="dev-repo-url">GitHub Repository</label>
              <input
                type="url"
                id="dev-repo-url"
                class="gs-input"
                placeholder="https://github.com/owner/repository"
                autocomplete="off"
                spellcheck="false"
              >
              <p class="gs-input-hint">Fetches package.json, Dockerfile, and workflow schemas through the GitHub API. No clone required.</p>
              <p class="gs-input-error" id="dev-url-error">Enter a valid GitHub repository URL, for example https://github.com/owner/repo</p>
            </div>

            <div class="gs-detection" id="dev-detection" style="display: none;">
              <div class="gs-detection-badge" id="detect-package" title="package.json">
                <span id="detect-package-icon">○</span>
                package.json
              </div>
              <div class="gs-detection-badge" id="detect-docker" title="Dockerfile">
                <span id="detect-docker-icon">○</span>
                Dockerfile
              </div>
              <div class="gs-detection-badge" id="detect-ci" title="GitHub Actions">
                <span id="detect-ci-icon">○</span>
                CI Workflows
              </div>
            </div>

            <div class="gs-action-row">
              <button
                id="dev-analyze-btn"
                class="gs-btn gs-btn-primary gs-btn-full"
                disabled
              >
                <span class="gs-btn-text">Analyze Repository</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  init() {
    const urlInput = document.getElementById('dev-repo-url');
    const analyzeBtn = document.getElementById('dev-analyze-btn');
    const urlError = document.getElementById('dev-url-error');
    const githubRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/;

    if (!urlInput || !analyzeBtn) return;

    // Real-time URL validation
    urlInput.addEventListener('input', () => {
      const value = urlInput.value.trim();
      const isValid = githubRegex.test(value);

      analyzeBtn.disabled = !isValid;
      urlError.classList.toggle('visible', value.length > 10 && !isValid);

      if (isValid) {
        urlInput.style.borderColor = 'var(--accent-primary)';
      } else {
        urlInput.style.borderColor = '';
      }
    });

    // Submit on Enter
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !analyzeBtn.disabled) {
        analyzeBtn.click();
      }
    });

    // Analyze button click
    analyzeBtn.addEventListener('click', async () => {
      const repoUrl = urlInput.value.trim();
      if (!githubRegex.test(repoUrl)) return;

      // Store for results page
      App.state.lastAnalysisType = 'repo';
      App.state.lastInput = { repoUrl };

      // Navigate to loading/results
      window.location.hash = '#results';
    });
  },
};
