const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const crudRoutes = require('./routes/crud');
const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/user');
const bookmarkRoutes = require('./routes/bookmarks');
const summaryRoutes = require('./routes/summaries');
const extensionsRoutes = require('./routes/extensions'); // Apply pass 5
const authMiddleware = require('./middleware/auth');
const { validateRuntime } = require('./config/runtime');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security headers
app.use(helmet());

// CORS — restrict to CLIENT_URL
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// General rate limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Limit is 100 per 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI rate limiter: 20 requests per user per hour
// keyGenerator prefers user ID; falls back to IP for unauthenticated requests
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => {
    // Authenticated requests: key by user ID (bypasses IPv6 issue)
    if (req.user && req.user.id) return `uid_${req.user.id}`;
    // Fallback: use IP (normalize IPv4-mapped IPv6)
    return (req.ip || '127.0.0.1').replace(/^::ffff:/, '');
  },
  message: { error: 'Too many AI requests. Limit is 20 per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

// Apply general limiter to all API routes
app.use('/api', generalLimiter);

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', authMiddleware, crudRoutes);
app.use('/api/ai', authMiddleware, aiRateLimiter, aiRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/bookmarks', authMiddleware, bookmarkRoutes);
app.use('/api/summaries', authMiddleware, summaryRoutes);
app.use('/api/extensions', authMiddleware, extensionsRoutes); // Apply pass 5
app.use('/api/permission-risk', authMiddleware, require('./routes/permissionRiskReview'));
app.use('/api/release-governance', authMiddleware, require('./routes/releaseGovernance'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    validateRuntime();
    await sequelize.authenticate();
    console.log('Database connected.');
    console.log('Database schema must be applied with scripts/migrate.sh.');
    
app.use('/api/browsing-copilot', require('./routes/browsingCopilotAgent')); // apply pass 6 — audit custom suggestion

app.use('/api/personal-recall', require('./routes/personalRecallRag')); // apply pass 6 — audit custom suggestion

app.use('/api/streaming-summary', require('./routes/streamingSummary')); // apply pass 6 — audit custom suggestion

app.use('/api/embed-sdk', require('./routes/embedSdkConfig')); // apply pass 6 — audit custom suggestion

app.use('/api/custom-views', require('./routes/customViews')); // Extension Views — 4 synthesized endpoints
app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      console.log(`CORS allowed origin: ${allowedOrigin}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

