/**
 * Results Panel Component - Renders analysis results with metrics, findings,
 * charts, strategies, and code blocks.
 */

const ResultsPanel = {
  render() {
    return `
      <section class="gs-results" id="gs-results" aria-label="Analysis results">
        <button class="gs-back-btn" id="results-back-btn" aria-label="Go back to workspace">Back</button>
        <div id="results-content" aria-live="polite" aria-atomic="false">
          ${this.renderLoading()}
        </div>
      </section>
    `;
  },

  renderLoading() {
    const isRepo = App.state.lastAnalysisType === 'repo';
    return `
      <div class="gs-loading" id="results-loading" role="status" aria-label="Loading analysis">
        <div class="gs-loading-skeleton" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <p class="gs-loading-text">Analyzing ${isRepo ? 'repository' : 'media'} carbon footprint...</p>
        <div class="gs-loading-steps">
          <div class="gs-loading-step active" id="step-1">
            <span class="gs-loading-step-icon">1</span>
            <span>${isRepo ? 'Fetching repository manifests...' : 'Computing streaming metrics...'}</span>
          </div>
          <div class="gs-loading-step" id="step-2">
            <span class="gs-loading-step-icon">2</span>
            <span>${isRepo ? 'Running GreenOps analysis...' : 'Analyzing CDN footprint...'}</span>
          </div>
          <div class="gs-loading-step" id="step-3">
            <span class="gs-loading-step-icon">3</span>
            <span>Generating mitigation strategies...</span>
          </div>
        </div>
      </div>
    `;
  },

  renderRepoResults(data) {
    const analysis = data.analysis || {};
    const summary = analysis.summary || {};
    const strategies = data.strategies || {};
    const equivalencies = analysis.equivalencies || {};
    const findings = analysis.allFindings || [];
    const score = summary.overallScore ?? 50;
    const carbonGrams = summary.totalEstimatedCarbonGrams || analysis.localMetrics?.estimatedCarbonGrams || 0;
    const carbonKg = (carbonGrams / 1000).toFixed(2);
    const severity = summary.severity || 'moderate';

    return `
      <div class="gs-workspace-header">
        <div class="gs-workspace-breadcrumb">
          <a href="#home">Home</a> <span>›</span>
          <a href="#dev">Dev Workspace</a> <span>›</span>
          <span>Results</span>
        </div>
        <h1 class="gs-workspace-title">Repository Analysis Results</h1>
        <p class="gs-workspace-subtitle">${data.repository || 'Repository'} analyzed at ${new Date(data.analyzedAt).toLocaleString()}</p>
      </div>

      <!-- Score Gauge -->
      <div class="gs-score" id="result-score">
        <div class="gs-score-ring">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle class="bg" cx="90" cy="90" r="80" />
            <circle class="fg ${severity}" cx="90" cy="90" r="80" id="score-arc" />
          </svg>
          <div class="gs-score-value">
            <span class="gs-score-number" id="score-number">0</span>
            <span class="gs-score-label">GREEN SCORE</span>
          </div>
        </div>
        <p class="gs-score-headline">${summary.headline || `Found ${findings.length} optimization opportunities.`}</p>
      </div>

      <!-- Metrics Grid -->
      <div class="gs-metrics-grid" id="result-metrics">
        <div class="gs-metric-card">
          <div class="gs-metric-icon" aria-hidden="true">CO2</div>
          <div class="gs-metric-value" id="metric-carbon">${carbonGrams}</div>
          <div class="gs-metric-unit">g CO₂e</div>
          <div class="gs-metric-label">Estimated Carbon per Build</div>
        </div>
        <div class="gs-metric-card">
          <div class="gs-metric-icon" aria-hidden="true">KM</div>
          <div class="gs-metric-value" id="metric-car">${equivalencies.carKm || 0}</div>
          <div class="gs-metric-unit">km</div>
          <div class="gs-metric-label">Equivalent Car Travel</div>
        </div>
        <div class="gs-metric-card">
          <div class="gs-metric-icon" aria-hidden="true">CHG</div>
          <div class="gs-metric-value" id="metric-phone">${equivalencies.smartphoneCharges || 0}</div>
          <div class="gs-metric-unit">charges</div>
          <div class="gs-metric-label">Smartphone Charges</div>
        </div>
        <div class="gs-metric-card">
          <div class="gs-metric-icon" aria-hidden="true">DAY</div>
          <div class="gs-metric-value" id="metric-tree">${equivalencies.treeDaysToOffset || 0}</div>
          <div class="gs-metric-unit">days</div>
          <div class="gs-metric-label">Tree Days to Offset</div>
        </div>
      </div>

      <!-- Detected Files -->
      ${data.detected ? `
      <div class="gs-detection" style="margin-bottom: var(--space-8);">
        <div class="gs-detection-badge ${data.detected.hasPackageJson ? 'detected' : 'missing'}">
          ${data.detected.hasPackageJson ? 'OK' : 'NO'} package.json
        </div>
        <div class="gs-detection-badge ${data.detected.hasDockerfile ? 'detected' : 'missing'}">
          ${data.detected.hasDockerfile ? 'OK' : 'NO'} Dockerfile
        </div>
        <div class="gs-detection-badge ${data.detected.hasWorkflows ? 'detected' : 'missing'}">
          ${data.detected.hasWorkflows ? 'OK' : 'NO'} CI Workflows (${data.detected.workflowCount || 0})
        </div>
      </div>
      ` : ''}

      <!-- Findings -->
      ${findings.length > 0 ? `
      <div class="gs-findings">
        <h2 class="gs-findings-title">Findings (${findings.length})</h2>
        ${findings.map((f, i) => `
          <div class="gs-finding-card" style="animation-delay: ${i * 50}ms;">
            <span class="gs-finding-severity ${f.severity}">
              ${f.severity === 'critical' ? '!' : f.severity === 'warning' ? '?' : 'i'}
            </span>
            <div>
              <div class="gs-finding-title">${this.escapeHtml(f.title)}</div>
              <div class="gs-finding-desc">${this.escapeHtml(f.description)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Strategies -->
      ${this.renderStrategies(strategies)}
    `;
  },

  renderMediaResults(data) {
    const analysis = data.analysis || {};
    const footprint = analysis.footprint || {};
    const aiAnalysis = analysis.aiAnalysis || {};
    const strategies = data.strategies || {};
    const carbon = footprint.carbon || {};
    const equivalencies = footprint.equivalencies || {};
    const dataTransfer = footprint.dataTransfer || {};
    const summary = aiAnalysis.summary || {};
    const insights = aiAnalysis.insights || [];

    return `
      <div class="gs-workspace-header">
        <div class="gs-workspace-breadcrumb">
          <a href="#home">Home</a> <span>›</span>
          <a href="#creator">Creator Workspace</a> <span>›</span>
          <span>Results</span>
        </div>
        <h1 class="gs-workspace-title">Streaming Carbon Analysis</h1>
        <p class="gs-workspace-subtitle">${summary.headline || `${carbon.totalKg || 0} kg CO₂e estimated`}</p>
      </div>

      <!-- Metrics Grid -->
      <div class="gs-metrics-grid" id="result-metrics">
        <div class="gs-metric-card">
          <div class="gs-metric-icon" aria-hidden="true">CO2</div>
          <div class="gs-metric-value" id="metric-carbon">${carbon.totalKg || 0}</div>
          <div class="gs-metric-unit">kg CO₂e</div>
          <div class="gs-metric-label">Total Carbon Emissions</div>
        </div>
        <div class="gs-metric-card">
          <div class="gs-metric-icon" aria-hidden="true">TB</div>
          <div class="gs-metric-value" id="metric-data">${dataTransfer.totalTB || 0}</div>
          <div class="gs-metric-unit">TB</div>
          <div class="gs-metric-label">Total Data Transfer</div>
        </div>
        <div class="gs-metric-card">
          <div class="gs-metric-icon" aria-hidden="true">KM</div>
          <div class="gs-metric-value" id="metric-car">${equivalencies.carKm || 0}</div>
          <div class="gs-metric-unit">km</div>
          <div class="gs-metric-label">Equivalent Car Travel</div>
        </div>
        <div class="gs-metric-card">
          <div class="gs-metric-icon" aria-hidden="true">DAY</div>
          <div class="gs-metric-value" id="metric-tree">${equivalencies.treeDaysToOffset || 0}</div>
          <div class="gs-metric-unit">days</div>
          <div class="gs-metric-label">Tree Days to Offset</div>
        </div>
      </div>

      <!-- Impact Statement -->
      ${summary.impactStatement ? `
      <div class="gs-input-card" style="margin-bottom: var(--space-8);">
        <p style="font-size: var(--text-base); color: var(--text-secondary); line-height: 1.7;">
          ${this.escapeHtml(summary.impactStatement)}
        </p>
      </div>
      ` : ''}

      <!-- Codec Comparison Chart -->
      ${footprint.codecComparison ? `
      <div class="gs-chart">
        <h2 class="gs-findings-title">Codec Comparison</h2>
        ${Object.entries(footprint.codecComparison).map(([codec, data]) => {
          const maxCarbon = Math.max(...Object.values(footprint.codecComparison).map(d => d.carbonKg));
          const width = maxCarbon > 0 ? (data.carbonKg / maxCarbon * 100) : 0;
          const isActive = codec === footprint.input?.codec;
          return `
            <div class="gs-chart-bar-row">
              <span class="gs-chart-bar-label" style="${isActive ? 'color: var(--accent-primary); font-weight: 700;' : ''}">
                ${codec.toUpperCase()}${isActive ? ' ACTIVE' : ''}
              </span>
              <div class="gs-chart-bar-track">
                <div class="gs-chart-bar-fill" style="width: ${width}%;${!isActive ? ' opacity: 0.6;' : ''}" data-width="${width}">
                  <span class="gs-chart-bar-value">${data.carbonKg.toFixed(1)} kg</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ` : ''}

      <!-- Resolution Comparison Chart -->
      ${footprint.resolutionComparison ? `
      <div class="gs-chart">
        <h2 class="gs-findings-title">Resolution Comparison</h2>
        ${Object.entries(footprint.resolutionComparison).map(([res, data]) => {
          const maxCarbon = Math.max(...Object.values(footprint.resolutionComparison).map(d => d.carbonKg));
          const width = maxCarbon > 0 ? (data.carbonKg / maxCarbon * 100) : 0;
          const isActive = res === footprint.input?.resolution;
          return `
            <div class="gs-chart-bar-row">
              <span class="gs-chart-bar-label" style="${isActive ? 'color: var(--accent-primary); font-weight: 700;' : ''}">
                ${res}${isActive ? ' ACTIVE' : ''}
              </span>
              <div class="gs-chart-bar-track">
                <div class="gs-chart-bar-fill" style="width: ${width}%;${!isActive ? ' opacity: 0.6;' : ''}" data-width="${width}">
                  <span class="gs-chart-bar-value">${data.carbonKg.toFixed(1)} kg</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ` : ''}

      <!-- Insights -->
      ${insights.length > 0 ? `
      <div class="gs-findings">
        <h2 class="gs-findings-title">Insights</h2>
        ${insights.map((insight, i) => `
          <div class="gs-finding-card" style="animation-delay: ${i * 50}ms;">
            <span class="gs-finding-severity info">
              ${insight.type === 'recommendation' ? 'R' : insight.type === 'efficiency' ? 'E' : 'i'}
            </span>
            <div>
              <div class="gs-finding-title">${this.escapeHtml(insight.title)}</div>
              <div class="gs-finding-desc">${this.escapeHtml(insight.description)}</div>
              ${insight.metric ? `<div style="margin-top: var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--accent-primary);">${this.escapeHtml(insight.metric)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Strategies -->
      ${this.renderStrategies(strategies)}
    `;
  },

  renderStrategies(strategies) {
    if (!strategies || !strategies.strategies || strategies.strategies.length === 0) return '';

    return `
      <div class="gs-strategies">
        <h2 class="gs-findings-title">Mitigation Strategies</h2>

        ${strategies.quickWins?.length ? `
        <div class="gs-quick-wins">
          <h3 class="gs-quick-wins-title">Quick Wins</h3>
          <ul class="gs-quick-wins-list">
            ${strategies.quickWins.map(w => `<li>${this.escapeHtml(w)}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${strategies.strategies.map((s, i) => `
          <div class="gs-strategy-card" style="animation-delay: ${i * 100}ms;">
            <div class="gs-strategy-header">
              <div class="gs-strategy-title">
                <span class="gs-strategy-priority ${s.priority || 'medium'}">${(s.priority || 'medium').toUpperCase()}</span>
                ${this.escapeHtml(s.title)}
              </div>
              ${s.estimatedSavingsPercent ? `
                <span class="gs-strategy-savings">${s.estimatedSavingsPercent}% lower emissions</span>
              ` : ''}
            </div>
            <p class="gs-strategy-desc">${this.escapeHtml(s.description)}</p>
            ${s.codeBlock ? `
              <div class="gs-code-block">
                <div class="gs-code-header">
                  <span class="gs-code-filename">${this.escapeHtml(s.codeBlock.filename || s.codeBlock.language || 'code')}</span>
                  <button class="gs-code-copy" onclick="ResultsPanel.copyCode(this)" data-code="${this.escapeAttr(s.codeBlock.code)}">
                    Copy
                  </button>
                </div>
                <div class="gs-code-content">
                  <pre>${this.escapeHtml(s.codeBlock.code)}</pre>
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}

        ${strategies.totalEstimatedSavingsPercent ? `
          <div class="gs-input-card" style="text-align: center;">
            <div style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: var(--space-2);">Total Estimated Savings</div>
            <div style="font-size: var(--text-4xl); font-weight: 900; font-family: var(--font-mono); color: var(--accent-primary);">
              ${strategies.totalEstimatedSavingsPercent}%
            </div>
            <div style="font-size: var(--text-sm); color: var(--text-tertiary); margin-top: var(--space-2);">carbon emissions reduction</div>
          </div>
        ` : ''}
      </div>
    `;
  },

  async init() {
    // Back button
    const backBtn = document.getElementById('results-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        const type = App.state.lastAnalysisType;
        window.location.hash = type === 'repo' ? '#dev' : type === 'media' ? '#creator' : '#home';
      });
    }

    // Run analysis
    const contentEl = document.getElementById('results-content');
    if (!contentEl || !App.state.lastAnalysisType || !App.state.lastInput) {
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="gs-loading">
            <p class="gs-loading-text">No analysis to display. Start from a workspace.</p>
            <a href="#home" class="gs-btn gs-btn-primary" style="margin-top: var(--space-4);">Go Home</a>
          </div>
        `;
      }
      return;
    }

    // Simulate loading steps
    const simulateSteps = async () => {
      await this.delay(800);
      this.activateStep('step-1', 'step-2');
      await this.delay(1200);
      this.activateStep('step-2', 'step-3');
    };

    try {
      let result;
      const stepSimulation = simulateSteps();

      if (App.state.lastAnalysisType === 'repo') {
        result = await API.analyzeRepo(App.state.lastInput.repoUrl);
      } else {
        result = await API.analyzeMedia(App.state.lastInput);
      }

      await stepSimulation;
      this.activateStep('step-3', null);
      await this.delay(500);

      // Render results
      App.state.lastResult = result;

      if (App.state.lastAnalysisType === 'repo') {
        contentEl.innerHTML = this.renderRepoResults(result);
      } else {
        contentEl.innerHTML = this.renderMediaResults(result);
      }

      // Animate score ring
      this.animateScoreRing(result);

      // Animate metrics
      this.animateMetrics();

      // Animate chart bars
      this.animateChartBars();

    } catch (error) {
      contentEl.innerHTML = `
        <div class="gs-loading">
          <div class="gs-error-mark">ERR</div>
          <p class="gs-loading-text" style="color: var(--color-critical);">Analysis Failed</p>
          <p style="color: var(--text-tertiary); font-size: var(--text-sm); max-width: 400px; text-align: center; margin-top: var(--space-2);">
            ${this.escapeHtml(error.message)}
          </p>
          <button class="gs-btn gs-btn-secondary" style="margin-top: var(--space-6);" onclick="location.reload()">
            Try Again
          </button>
        </div>
      `;
    }
  },

  activateStep(currentId, nextId) {
    const current = document.getElementById(currentId);
    if (current) {
      current.classList.remove('active');
      current.classList.add('done');
      const icon = current.querySelector('.gs-loading-step-icon');
      if (icon) icon.textContent = 'OK';
    }
    if (nextId) {
      const next = document.getElementById(nextId);
      if (next) next.classList.add('active');
    }
  },

  animateScoreRing(result) {
    const arc = document.getElementById('score-arc');
    const number = document.getElementById('score-number');
    if (!arc || !number) return;

    const score = result?.analysis?.summary?.overallScore ?? 50;
    const circumference = 2 * Math.PI * 80; // r=80
    const offset = circumference - (score / 100) * circumference;

    requestAnimationFrame(() => {
      arc.style.strokeDashoffset = offset;
    });

    Animations.countUp(number, score, 1500);
  },

  animateMetrics() {
    // Counter animations for metric values
    document.querySelectorAll('.gs-metric-value').forEach((el) => {
      const value = parseFloat(el.textContent);
      if (!isNaN(value) && value > 0) {
        if (Number.isInteger(value)) {
          Animations.countUp(el, value, 1200);
        } else {
          Animations.countUpDecimal(el, value, 2, 1200);
        }
      }
    });
  },

  animateChartBars() {
    // Animate bar widths from 0
    document.querySelectorAll('.gs-chart-bar-fill').forEach((bar) => {
      const targetWidth = bar.getAttribute('data-width');
      if (targetWidth) {
        bar.style.width = '0%';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            bar.style.width = targetWidth + '%';
          });
        });
      }
    });
  },

  copyCode(button) {
    const code = button.getAttribute('data-code');
    navigator.clipboard.writeText(code).then(() => {
      button.textContent = 'Copied!';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = 'Copy';
        button.classList.remove('copied');
      }, 2000);
    });
  },

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
};
