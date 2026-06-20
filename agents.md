# Multi-Agent Orchestration Architecture (`agents.md`)

GreenStack.ai utilizes an internal Multi-Agent Orchestration framework powered natively by the `gemini-2.5-flash` model. Instead of relying on a single monolithic prompt, the application splits analytical reasoning into isolated, highly specialized logical agents operating within a high-performance, strictly typed JSON context engine.

┌──────────────────────────────┐
                │  Unified Input Orchestrator  │
                └──────────────┬───────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼
┌───────────────────────┐                     ┌───────────────────────┐
│   Dev GreenOps Agent  │                     │  Media Streaming Agent│
├───────────────────────┤                     ├───────────────────────┤
│ Parses targeted repo  │                     │ Parses: Bitrates,     │
│ manifests via API     │                     │ CDN data, view counts │
└───────────┬───────────┘                     └───────────┬───────────┘
│                                             │
└──────────────────────┬──────────────────────┘
▼
┌────────────────────────┐
│ Strategy Recommender   │
└────────────────────────┘

### 1. Ingestion & Input Orchestrator Agent
* **Model Configuration:** `gemini-2.5-flash` (Structured System Instruction Layer)
* **Role:** Context Router & Input Validator
* **Objective:** Intercept ingress data streams (GitHub Public API response payloads or YouTube Metadata objects), normalize structural signatures, and isolate relevant analytical tracks to keep latency minimal.
* **Execution Strategy:** Extracts targeted configuration blocks (`dependencies`, `base image tags`, `view scales`) and filters out irrelevant clutter before routing to specialized workers.

### 2. Developer GreenOps Architecture Agent
* **Model Configuration:** `gemini-2.5-flash` (Reasoning & Optimization Core)
* **Role:** Targeted Manifest Static Analyzer & Infrastructure Auditor
* **Objective:** Evaluate dependency overhead, build-matrix inefficiencies, and deployment configuration flows without cloning source repositories.
* **Analytical Target:**
  * Maps `package.json` configuration blocks to continuous integration (CI) compile energy draws.
  * Audits `Dockerfile` layer hygiene to calculate unnecessary storage and container transport overhead.
  * Inspects GitHub Actions workflow schemas for missing cache keys to minimize cloud runner compute runtime.

### 3. Media Network Streaming Agent
* **Model Configuration:** `gemini-2.5-flash` (Multimodal Network Evaluator)
* **Role:** Content Delivery Network (CDN) & Grid Intensity Auditor
* **Objective:** Quantify ambient carbon emissions triggered by creative digital asset distribution at scale.
* **Analytical Target:**
  * Translates video duration metrics and resolution variables into raw streaming data footprints (Terabytes transferred).
  * Multiplies systemic transmission payloads against scaled audience target vectors.
  * Tracks the net environmental delta between high-efficiency modern container profiles (AV1, VP9) and legacy bitstreams (H.264).

### 4. Mitigation Strategist Agent
* **Model Configuration:** `gemini-2.5-flash` (Code Generation Engine)
* **Role:** Refactoring & Action-Plan Generator
* **Objective:** Convert pure carbon metric numbers into direct, executable engineering tasks.
* **Execution Strategy:** Outputs syntactically valid code blocks (e.g., cached GitHub Actions YAML blocks, optimized Docker multi-stage build configurations) and explicit asset compression targets so users can act on insights instantly.