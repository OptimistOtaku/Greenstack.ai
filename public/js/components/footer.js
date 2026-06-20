/**
 * Footer Component - minimal branding footer.
 */

const Footer = {
  render() {
    return `
      <footer class="gs-footer" id="gs-footer">
        <div class="gs-footer-inner">
          <span class="gs-footer-text">
            GreenStack.ai maps carbon cost across software and media delivery.
          </span>
          <div class="gs-footer-links">
            <a href="#home">Home</a>
            <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
            <a href="#dev">Get Started</a>
          </div>
        </div>
      </footer>
    `;
  },

  init() {
    // No dynamic behavior needed
  },
};
