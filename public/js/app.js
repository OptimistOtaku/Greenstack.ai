/**
 * App - Main SPA controller with hash-based routing.
 */

const App = {
  state: {
    currentRoute: 'home',
    lastAnalysisType: null,  // 'repo' or 'media'
    lastInput: null,
    lastResult: null,
  },

  routes: {
    home: { component: Hero, title: 'GreenStack.ai - Serverless GreenOps Platform' },
    dev: { component: DevWorkspace, title: 'Developer Workspace - GreenStack.ai' },
    creator: { component: CreatorWorkspace, title: 'Creator Workspace - GreenStack.ai' },
    results: { component: ResultsPanel, title: 'Analysis Results - GreenStack.ai' },
  },

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.navigate());

    // Initial render
    this.navigate();
  },

  navigate() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const route = this.routes[hash];

    if (!route) {
      window.location.hash = '#home';
      return;
    }

    this.state.currentRoute = hash;

    // Update page title
    document.title = route.title;

    // Render
    this.render(hash, route);
  },

  render(routeName, route) {
    const app = document.getElementById('app');
    if (!app) return;

    // Build page HTML with semantic landmarks
    const html = [
      Header.render(routeName),
      '<main id="main-content" role="main">',
      route.component.render(),
      '</main>',
      Footer.render(),
    ].join('');

    app.innerHTML = html;

    // Initialize components
    Header.init();
    route.component.init();
    Footer.init();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Focus management — move focus to main heading after navigation
    requestAnimationFrame(() => {
      const heading = document.querySelector('#main-content h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    });

    // Initialize scroll animations
    Animations.initScrollAnimations();
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
