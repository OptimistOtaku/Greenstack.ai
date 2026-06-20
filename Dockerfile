# ── Stage 1: Install Dependencies ───────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Production Image ──────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY server/ ./server/
COPY public/ ./public/
COPY package.json ./

# Switch to non-root user
USER appuser

# Cloud Run expects port 8080
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "server/index.js"]
