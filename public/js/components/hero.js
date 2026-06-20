/**
 * Hero Component - landing page with agent topology and workspace entry points.
 */

const Hero = {
  render() {
    return `
      <section class="gs-hero" id="gs-hero">
        <div class="gs-hero-bg">
          <canvas id="hero-particles"></canvas>
        </div>
        <div class="gs-hero-content">
          <div class="gs-hero-copy">
            <div class="gs-hero-badge" id="hero-badge">
              <span class="gs-hero-badge-mark" aria-hidden="true"></span>
              Your personal carbon footprint, analyzed
            </div>
            <h1 class="gs-hero-title" id="hero-title">
              Find your carbon leaks.
            </h1>
            <div class="gs-hero-tagline">
              Built for individual developers — not engineering orgs
            </div>
            <p class="gs-hero-subtitle" id="hero-subtitle">
              Paste your repo or your video's specs. See exactly how much carbon you're responsible for — and exactly what to fix first.
            </p>
            <div class="gs-hero-actions">
              <a class="gs-btn gs-btn-primary" href="#dev">Analyze Repository</a>
              <a class="gs-btn gs-btn-secondary" href="#creator">Model Streaming Load</a>
            </div>
          </div>

          <div class="gs-agent-map" aria-label="GreenStack analysis flow">
            <div class="gs-agent-node gs-agent-node--input">
              <span class="gs-node-kicker">INPUT</span>
              <strong>Unified Orchestrator</strong>
              <small>routes payload signatures</small>
            </div>
            <div class="gs-agent-branches">
              <div class="gs-agent-node">
                <span class="gs-node-kicker">DEV</span>
                <strong>GreenOps Agent</strong>
                <small>manifests, Docker, CI</small>
              </div>
              <div class="gs-agent-node">
                <span class="gs-node-kicker">MEDIA</span>
                <strong>Streaming Agent</strong>
                <small>bitrate, codec, reach</small>
              </div>
            </div>
            <div class="gs-agent-node gs-agent-node--output">
              <span class="gs-node-kicker">OUTPUT</span>
              <strong>Mitigation Strategist</strong>
              <small>executable next steps</small>
            </div>
          </div>
        </div>

        <div class="gs-hero-cards" id="hero-cards">
          <div class="gs-hero-card-shell">
            <div class="gs-hero-card" id="hero-card-dev" tabindex="0" role="button" aria-label="Analyze a GitHub repository">
              <span class="gs-card-code" aria-hidden="true">01</span>
              <h2 class="gs-hero-card-title">Developer Workspace</h2>
              <p class="gs-hero-card-desc">
                See the carbon cost hiding in your Dockerfile and CI workflows — no repo cloning needed.
              </p>
              <span class="gs-hero-card-arrow">Open</span>
            </div>
          </div>
          <div class="gs-hero-card-shell">
            <div class="gs-hero-card" id="hero-card-creator" tabindex="0" role="button" aria-label="Analyze streaming content">
              <span class="gs-card-code" aria-hidden="true">02</span>
              <h2 class="gs-hero-card-title">Creator Workspace</h2>
              <p class="gs-hero-card-desc">
                See the carbon cost of the videos you publish — before you hit upload.
              </p>
              <span class="gs-hero-card-arrow">Open</span>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  init() {
    // CTA card clicks
    const devCard = document.getElementById('hero-card-dev');
    const creatorCard = document.getElementById('hero-card-creator');

    if (devCard) {
      devCard.addEventListener('click', () => {
        window.location.hash = '#dev';
      });
      devCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.hash = '#dev';
        }
      });
    }

    if (creatorCard) {
      creatorCard.addEventListener('click', () => {
        window.location.hash = '#creator';
      });
      creatorCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.hash = '#creator';
        }
      });
    }

    const canvas = document.getElementById('hero-particles');
    if (canvas) {
      Animations.createParticles(canvas, 42);
    }
  },
};
