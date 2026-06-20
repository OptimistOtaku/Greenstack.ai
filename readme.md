# GreenStack.ai — Serverless GreenOps Platform for Developers & Creators

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Google Cloud Run](https://img.shields.io/badge/Deployed-Cloud%20Run-4285F4)](https://cloud.google.com/run)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8E75B2)](https://ai.google.dev)

GreenStack.ai is an automated, zero-friction GreenOps platform tailored for developers and content creators. It uncovers and eliminates hidden digital carbon leaks in cloud architectures and content delivery pipelines by targeting explicit system manifests instead of running heavy local processes.

---

## Chosen Vertical
**Digital Infrastructure, Cloud Computing, & Streaming Media Tracking**

---

## Approach & Logic
Traditional carbon tracking platforms rely on high-friction manual text logs or exhaustive multi-question surveys that result in immediate user abandonment. GreenStack.ai disrupts this model through **Targeted Manifest Parsing**:

1. **Developer Workspaces:** Users input a public GitHub repository link. The backend makes precision calls to the GitHub API to fetch *only* critical configuration files (`package.json`, `Dockerfile`, `.github/workflows/*.yml`). This completely avoids cloning heavy source repositories, reducing server-side execution cycles to milliseconds.
2. **Creator Workspaces:** Users input video parameters and adjust target audience scales. The application assesses video length, framerates, and default resolution profiles across global content distribution networks (CDNs) to measure real-world streaming data footprints.
3. **Serverless Operations:** Deployed natively on **Google Cloud Run**, the backend utilizes isolated containers that scale down to absolute zero when idle, minimizing server infrastructure draw and adhering strictly to green computing principles.

---

## How It Works

### Technical Architecture

```
┌───────────────────────────────┐
│   Unified Input Orchestrator  │
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
       │   Mitigation    │
       │   Strategist    │
       └─────────────────┘
```

**Agent Pipeline:**
* **Ingestion Layer:** Frontend components capture public asset links and validate input integrity client-side.
* **Analysis Services Layer (`/server/services`):** Isolated, decoupled service modules parse incoming data signatures. Route handlers remain completely thin wrappers to maximize codebase maintainability and structure.
* **Intelligence Layer (Gemini 2.5 Flash):** System instruction prompts map incoming metadata parameters directly against known energy grid matrices using strict, structured JSON schemas (`responseMimeType: "application/json"`).
* **Analytics Layer (Google BigQuery):** Audit events are streamed asynchronously directly into a BigQuery data lake for continuous historical tracking and community benchmarking.
* **Localization Layer (Google Cloud Translation API):** Dynamic dashboard elements shift languages gracefully using cloud translation hooks tied to systemic HTML lang attributes.

---

## Google Services Integration

| Service | Usage | Integration Point |
|---|---|---|
| **Gemini 2.5 Flash** | Multi-agent structured JSON analysis with system instructions | `server/utils/gemini-client.js` |
| **Google Cloud Run** | Serverless container deployment (scale-to-zero) | `.github/workflows/deploy.yml` |
| **Google BigQuery** | Audit event streaming for historical carbon tracking | `server/services/bigquery.service.js` |
| **Google Cloud Translation** | Dynamic UI language switching (10 languages) | `server/services/translation.service.js` |
| **Google Fonts** | Typography (Outfit + JetBrains Mono) | `public/index.html` |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check with configuration status |
| `POST` | `/api/analyze/repo` | Analyze GitHub repo carbon footprint |
| `POST` | `/api/analyze/media` | Calculate streaming media carbon emissions |
| `POST` | `/api/translate` | Translate UI text via Cloud Translation API |

---

## Security

- **API Key Protection:** All secrets stored in `.env` (git-ignored) — never committed to source control
- **HTTP Security Headers:** Helmet.js enforces CSP, X-Frame-Options, HSTS, and more
- **Rate Limiting:** 100 requests per 15 minutes per IP via `express-rate-limit`
- **Input Validation:** Strict server-side validation on all API endpoints with type checking and range limits
- **Request Timeouts:** 30-second global timeout prevents resource exhaustion
- **CORS:** Origin-restricted in production, permissive only in development
- **Non-root Docker:** Production container runs as `appuser` (UID 1001)

---

## Testing

Tests use **Node.js built-in test runner** (zero test framework dependencies):

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

**Coverage:**
- Carbon constants validation (ranges, ordering, data integrity)
- Media streaming footprint calculations (all resolutions × codecs)
- Gemini client configuration detection
- Full API endpoint integration tests (validation, security headers, error handling)

---

## Assumptions Made
* **Data Transmission Metrics:** Standard 4K UHD video distribution over CDNs assumes an average bandwidth payload consumption of 7.2 GB per hour. Standard 1080p HD streams assume 2.1 GB per hour.
* **Grid Intensity Coefficients:** Calculations rely on international baseline averages tracking carbon intensity vectors (gCO₂e/kWh) corresponding to localized regional cloud hubs sourced from IEA Global Energy Review.
* **Compute Runtimes:** GitHub runner processing draw assumptions operate on default generic hardware configuration baselines unless specific runner keys are flagged within the workflow files.
* **Codec Efficiency:** AV1 achieves ~65% compression improvement over H.264, H.265 achieves ~50%, VP9 achieves ~45%, based on Shift Project Lean ICT Report methodology.

---

## Local Setup & Deployment

### Prerequisites
- Node.js ≥ 18.0.0
- npm

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values:
# PORT=8080
# GEMINI_API_KEY=your_gemini_api_key_here
# GOOGLE_APPLICATION_CREDENTIALS=path_to_your_gcp_service_account.json  (optional)
```

### Installation & Run
```bash
npm install
npm run dev     # Development with hot-reload
npm start       # Production
npm test        # Run test suite
```

### Docker
```bash
docker build -t greenstack-ai .
docker run -p 8080:8080 --env-file .env greenstack-ai
```

### Cloud Run Deployment
Automated via GitHub Actions on push to `main`. See `.github/workflows/deploy.yml`.

---

## Project Structure

```
greenstack-ai/
├── server/
│   ├── index.js                  # Express server with security middleware
│   ├── agents/
│   │   ├── orchestrator.js       # Agent 1: Input routing & pipeline coordination
│   │   ├── devGreenOps.js        # Agent 2: Manifest static analysis
│   │   ├── mediaStreaming.js      # Agent 3: CDN footprint calculation
│   │   └── strategist.js         # Agent 4: Mitigation code generation
│   ├── routes/
│   │   ├── analyze-repo.js       # POST /api/analyze/repo
│   │   ├── analyze-media.js      # POST /api/analyze/media
│   │   └── translate.js          # POST /api/translate
│   ├── services/
│   │   ├── github.service.js     # GitHub API manifest fetcher
│   │   ├── media.service.js      # Streaming carbon calculator
│   │   ├── bigquery.service.js   # BigQuery audit event streaming
│   │   └── translation.service.js # Cloud Translation API wrapper
│   └── utils/
│       ├── gemini-client.js      # Gemini SDK wrapper (structured JSON)
│       └── carbon-constants.js   # Energy grid coefficients & data rates
├── public/
│   ├── index.html                # SPA entry point with SEO meta tags
│   ├── css/index.css             # Full design system (1500+ lines)
│   └── js/
│       ├── app.js                # Hash-based SPA router
│       ├── components/           # UI components (header, hero, workspaces, results)
│       └── utils/                # API client, animations
├── tests/
│   ├── unit/                     # Carbon constants, media service, Gemini client
│   └── integration/              # API endpoint tests
├── Dockerfile                    # Multi-stage, non-root production build
├── .github/workflows/deploy.yml  # CI/CD to Cloud Run
└── .env.example                  # Environment template
```

---

## License

[MIT](LICENSE) © GreenStack.ai