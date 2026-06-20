# Contributing to GreenStack.ai

Thank you for your interest in contributing to GreenStack.ai! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Greenstack.ai.git`
3. Install dependencies: `npm install`
4. Copy environment config: `cp .env.example .env`
5. Start the development server: `npm run dev`

## Development Workflow

### Branch Naming
- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation updates

### Code Style
- Use ES6+ syntax (const/let, arrow functions, template literals)
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for components)
- Add JSDoc comments to all exported functions
- Keep route handlers thin — business logic belongs in services and agents

### Testing
Run the test suite before submitting:

```bash
npm test
```

Tests use Node.js built-in test runner (`node:test`) — no external testing frameworks required.

### Commit Messages
Use clear, descriptive commit messages:
- `feat: add codec comparison chart to media results`
- `fix: handle null dockerfile in DevGreenOps agent`
- `docs: update API reference in README`

## Project Architecture

GreenStack.ai uses a multi-agent orchestration architecture:

1. **Orchestrator** routes input to specialized agents
2. **DevGreenOps Agent** analyzes repository manifests
3. **Media Streaming Agent** calculates CDN carbon footprint
4. **Strategist Agent** generates executable mitigation code

All agents share the Gemini client (`server/utils/gemini-client.js`) for structured JSON responses.

## Reporting Issues

When reporting bugs, please include:
- Steps to reproduce
- Expected vs actual behavior
- Node.js version (`node --version`)
- Relevant error messages or console output

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
