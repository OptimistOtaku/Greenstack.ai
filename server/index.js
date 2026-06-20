require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const analyzeRepoRouter = require('./routes/analyze-repo');
const analyzeMediaRouter = require('./routes/analyze-media');
const translateRouter = require('./routes/translate');

const app = express();
const PORT = process.env.PORT || 8080;

// ── Security Middleware ────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── Performance Middleware ──────────────────────────────────
app.use(compression());

// ── CORS — restrict origins in production ──────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8080', 'http://localhost:3000'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? allowedOrigins
    : true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '1mb' }));

// ── Rate Limiting ──────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again in a few minutes.',
  },
});

app.use('/api/', apiLimiter);

// ── Request Timeout ────────────────────────────────────────
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout', message: 'The request took too long to process.' });
  });
  next();
});

// ── Static Frontend with Caching ───────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
  etag: true,
}));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/analyze', analyzeRepoRouter);
app.use('/api/analyze', analyzeMediaRouter);
app.use('/api', translateRouter);

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'greenstack-ai',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    bigqueryConfigured: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
});

// ── SPA Fallback ───────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ── Start Server ───────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🌿 GreenStack.ai server running on http://localhost:${PORT}`);
    console.log(`   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log(`   BigQuery:   ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅ Configured' : '⏭️  Skipped (optional)'}\n`);
  });
}

module.exports = app;
