/**
 * Header Component - sticky navigation with skip-to-content and language selector.
 */

const Header = {
  render(activeRoute) {
    return `
      <a class="gs-skip-link" href="#main-content" id="skip-link">Skip to content</a>
      <header class="gs-header" id="gs-header" role="banner">
        <div class="gs-header-inner">
          <a href="#home" class="gs-logo" id="header-logo" aria-label="GreenStack.ai — Go to home page">
            <span class="gs-logo-icon" aria-hidden="true">GS</span>
            <span class="gs-logo-text">GreenStack<span>.ai</span></span>
          </a>
          <nav class="gs-nav" id="header-nav" aria-label="Main navigation">
            <a href="#home" class="gs-nav-link ${activeRoute === 'home' ? 'active' : ''}" id="nav-home" ${activeRoute === 'home' ? 'aria-current="page"' : ''}>Home</a>
            <a href="#dev" class="gs-nav-link ${activeRoute === 'dev' ? 'active' : ''}" id="nav-dev" ${activeRoute === 'dev' ? 'aria-current="page"' : ''}>Developers</a>
            <a href="#creator" class="gs-nav-link ${activeRoute === 'creator' ? 'active' : ''}" id="nav-creator" ${activeRoute === 'creator' ? 'aria-current="page"' : ''}>Creators</a>
            <div class="gs-lang-selector" id="lang-selector">
              <select id="lang-select" class="gs-lang-select" aria-label="Select language">
                <option value="en" selected>EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="de">DE</option>
                <option value="hi">HI</option>
                <option value="ja">JA</option>
              </select>
            </div>
            <a href="#dev" class="gs-nav-cta" id="nav-analyze-cta">Run Audit</a>
          </nav>
        </div>
      </header>
    `;
  },

  init() {
    const header = document.getElementById('gs-header');
    if (!header) return;

    // Scroll effect
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Language selector
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        document.documentElement.setAttribute('lang', lang);
        console.log(`🌐 Language switched to: ${lang}`);
      });
    }
  },
};
