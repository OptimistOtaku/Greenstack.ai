# GreenStack.ai — Know Your Carbon Footprint as a Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Google Cloud Run](https://img.shields.io/badge/Deployed-Cloud%20Run-4285F4)](https://cloud.google.com/run)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8E75B2)](https://ai.google.dev)

> **PromptWars Virtual Hackathon | Hack2Skill — Challenge 3**
> Helps an individual developer or content creator understand, track, and reduce the carbon footprint **they personally generate** through the code they ship and the content they publish.

Every commit, every Docker build, every video upload has a carbon cost — and almost no individual creator can see it. GreenStack.ai makes that invisible footprint visible to the one person who can actually change it: **the builder themselves**. Paste your own repo. See your own footprint. Get your own action plan.

---

## 1. Chosen Vertical

**Carbon Footprint Awareness — for the Individual Developer & Content Creator**

Most carbon-tracking tools ask individuals to log groceries and commutes — useful, but disconnected from where a huge number of people, especially in tech, actually spend their day: writing code and publishing content. GreenStack.ai applies the same "understand → track → reduce" loop the challenge asks for, but to a footprint individuals create and control directly — **their own repositories and their own media output** — rather than asking them to manually estimate household activity they'd have to guess at anyway.

The user is always one person, looking at their own work, getting advice for their own choices. No teams, no org accounts, no enterprise dashboards.

---

## 2. Approach & Logic

### Why not a manual survey?
Every generic carbon calculator asks the same 20 multiple-choice questions and gets abandoned by 80% of users before the result page. GreenStack.ai instead asks for **one thing a developer already has**: a public GitHub link, or a video's basic parameters. That's the entire input. This is a deliberate UX decision to maximize the "real-world usability" criterion — the lowest-friction path to a personalized result.

### Targeted Manifest Parsing (not repo cloning)
Instead of cloning and executing a user's repository — slow, resource-heavy, and a security risk — GreenStack.ai fetches **only the specific configuration files that reveal infrastructure choices**: `package.json`, `Dockerfile`, and `.github/workflows/*.yml`, via direct GitHub API calls. This keeps server-side execution to milliseconds and means the platform never runs untrusted code.

### Two Individual Workspaces, One Mitigation Engine
1. **Developer Workspace** — a user pastes *their own* public repo. GreenStack.ai infers hosting patterns, CI/CD frequency, and dependency weight from the manifest files, then estimates the associated compute and energy footprint.
2. **Creator Workspace** — a user inputs *their own* video's length, resolution, and expected audience size. The platform estimates the CDN distribution footprint using published codec and bandwidth research.

Both paths converge on the same **Mitigation Strategist agent**, which uses Gemini 2.5 Flash to turn a raw footprint number into 3–5 ranked, specific actions the individual can take this week — not a generic "use less electricity" tip, but suggestions tied to what was actually found in their repo or video settings.

### Serverless by Principle, Not Just by Convenience
The backend itself practices what it measures — deployed on **Google Cloud Run**, scaling to zero when idle, so the tool's own infrastructure footprint stays close to nothing between uses.

---

## 3. How the Solution Works

### Technical Architecture

```
┌───────────────────────────────┐
│   Unified Input Orchestrator  │   ← one person, one link/video, one click
└──────────────┬────────────────┘
               │
  ┌────────────┴────────────┐
  ▼                         ▼
┌──────────────┐  ┌─────────────────┐
│ Dev GreenOps │  │ Media Streaming │
│    Agent     │  │     Agent       │
└──────┬───────┘  └────────┬────────┘
       │                   │
       └─────────┬─────────┘
                 ▼
       ┌─────────────────┐
       │   Mitigation    │   ← personalized to THIS user's
       │   Strategist    │     repo / video, ranked by impact
       └─────────────────┘
```

**Agent Pipeline:**
- **Ingestion Layer** — frontend captures the individual's public asset link (repo or video params) and validates input client-side before any server call.
- **Analysis Services Layer** (`server/services`) — isolated, decoupled service modules parse the incoming data signature. Route handlers are thin wrappers only; all logic lives in services for maintainability.
- **Intelligence Layer** (Gemini 2.5 Flash) — structured JSON output (`responseMimeType: "application/json"`) maps the user's specific inputs against known energy-grid and codec-efficiency data, then generates personalized mitigation suggestions.
- **Analytics Layer** (Google BigQuery) — each analysis is streamed into BigQuery, letting a returning user see their footprint trend over time and compare anonymously against the community baseline.
- **Localization Layer** (Google Cloud Translation API) — the full dashboard works in 10 languages, so the tool isn't gated behind English fluency.

### Feature Breakdown

| Feature | What the individual sees |
|---|---|
| 🔍 Repo Analyzer | Paste your GitHub repo → see the estimated compute/CI footprint of *your* project |
| 🎬 Media Analyzer | Enter *your* video's specs → see *your* content's CDN carbon cost |
| 🤖 Mitigation Strategist | Gemini-ranked, repo-specific actions — e.g. switch *your* CI runner, change *your* video codec |
| 📊 Personal History | BigQuery-backed trend of *your* past analyses over time |
| 🌐 10-language UI | Footprint awareness isn't limited to English speakers |

---

## Google Services Integration

| Service | Usage | Integration Point | Depth |
|---|---|---|---|
| **Gemini 2.5 Flash** | Structured JSON analysis + personalized mitigation generation | `server/utils/gemini-client.js` | Deep |
| **Google Cloud Run** | Serverless, scale-to-zero deployment | `.github/workflows/deploy.yml` | Deep |
| **Google BigQuery** | Per-user audit event streaming for historical tracking | `server/services/bigquery.service.js` | Deep |
| **Google Cloud Translation** | 10-language dynamic UI switching | `server/services/translation.service.js` | Medium |
| **Google Fonts** | Typography (Outfit + JetBrains Mono) | `public/index.html` | Light |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check with configuration status |
| `POST` | `/api/analyze/repo` | Analyze an individual's public GitHub repo footprint |
| `POST` | `/api/analyze/media` | Calculate an individual's streaming media footprint |
| `POST` | `/api/translate` | Translate UI text via Cloud Translation API |

---

## 4. Assumptions Made

- **Data Transmission Metrics** — 4K UHD video distribution over CDNs assumes ~7.2 GB/hour average bandwidth; 1080p HD assumes ~2.1 GB/hour.
- **Grid Intensity Coefficients** — calculations use international baseline carbon intensity (gCO₂e/kWh) by regional cloud hub, sourced from the IEA Global Energy Review.
- **Compute Runtimes** — GitHub Actions runner draw assumes default generic hardware unless a specific runner type is declared in the workflow file.
- **Codec Efficiency** — AV1 ≈ 65% compression improvement over H.264, H.265 ≈ 50%, VP9 ≈ 45%, based on the Shift Project Lean ICT Report methodology.
- **Single-user scope** — the platform is built for one individual analyzing their own public assets, not team or organization-wide auditing. No login is required; BigQuery history is keyed to a generated session, not an account.
- **Public repos/videos only** — private repository analysis would require OAuth scopes beyond this submission's scope.

---

## Security

- **API Key Protection** — all secrets in `.env`, git-ignored, never committed
- **HTTP Security Headers** — Helmet.js enforces CSP, X-Frame-Options, HSTS, and more
- **Rate Limiting** — 100 requests / 15 minutes / IP via `express-rate-limit`
- **Input Validation** — strict server-side validation on all endpoints, type checking and range limits
- **Request Timeouts** — 30-second global timeout prevents resource exhaustion
- **CORS** — origin-restricted in production, permissive only in development
- **Non-root Docker** — production container runs as `appuser` (UID 1001)

---

## Testing

Node.js built-in test runner — zero extra framework dependencies.

```bash
npm test                  # all tests
npm run test:unit         # unit tests only
npm run test:integration  # integration tests only
```

**Coverage:**
- Carbon constants validation (ranges, ordering, data integrity)
- Media streaming footprint calculations (all resolutions × codecs)
- Gemini client configuration detection
- Full API endpoint integration tests (validation, security headers, error handling)

---

## Local Setup & Deployment

### Prerequisites
- Node.js ≥ 18.0.0
- npm

### Environment Configuration
```bash
cp .env.example .env
# PORT=8080
# GEMINI_API_KEY=your_gemini_api_key_here
# GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json  (optional)
```

### Installation & Run
```bash
npm install
npm run dev     # development with hot-reload
npm start       # production
npm test        # run test suite
```

### Docker
```bash
docker build -t greenstack-ai .
docker run -p 8080:8080 --env-file .env greenstack-ai
```

### Cloud Run Deployment
Automated via GitHub Actions on push to `main`. See `.github/workflows/deploy.yml`.

**Live demo:** https://greenstack-ai-xqrdo6evtq-el.a.run.app/

---

## Project Structure

```
greenstack-ai/
├── server/
│   ├── index.js                   # Express server with security middleware
│   ├── agents/
│   │   ├── orchestrator.js        # Routes a single user's input to the right agent
│   │   ├── devGreenOps.js         # Manifest static analysis
│   │   ├── mediaStreaming.js      # CDN footprint calculation
│   │   └── strategist.js          # Personalized mitigation generation
│   ├── routes/
│   │   ├── analyze-repo.js        # POST /api/analyze/repo
│   │   ├── analyze-media.js       # POST /api/analyze/media
│   │   └── translate.js           # POST /api/translate
│   ├── services/
│   │   ├── github.service.js      # GitHub API manifest fetcher
│   │   ├── media.service.js       # Streaming carbon calculator
│   │   ├── bigquery.service.js    # BigQuery audit event streaming
│   │   └── translation.service.js # Cloud Translation API wrapper
│   └── utils/
│       ├── gemini-client.js       # Gemini SDK wrapper (structured JSON)
│       └── carbon-constants.js    # Energy grid coefficients & data rates
├── public/
│   ├── index.html                 # SPA entry point with SEO meta tags
│   ├── css/index.css              # Full design system
│   └── js/
│       ├── app.js                 # Hash-based SPA router
│       ├── components/            # UI components (header, hero, workspaces, results)
│       └── utils/                 # API client, animations
├── tests/
│   ├── unit/                      # Carbon constants, media service, Gemini client
│   └── integration/               # API endpoint tests
├── Dockerfile                     # Multi-stage, non-root production build
├── .github/workflows/deploy.yml   # CI/CD to Cloud Run
└── .env.example                   # Environment template
```

---

## License

[MIT](LICENSE) © GreenStack.ai
