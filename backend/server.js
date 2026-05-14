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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync();
    console.log('Models synced.');
    
app.use('/api/browsing-copilot', require('./routes/browsingCopilotAgent')); // apply pass 6 — audit custom suggestion

app.use('/api/personal-recall', require('./routes/personalRecallRag')); // apply pass 6 — audit custom suggestion

app.use('/api/streaming-summary', require('./routes/streamingSummary')); // apply pass 6 — audit custom suggestion

app.use('/api/embed-sdk', require('./routes/embedSdkConfig')); // apply pass 6 — audit custom suggestion
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


// === Batch 01 Gaps & Frontend Mounts ===
app.use('/api/gap-26-ai-endpoints-exist-but-only-4-frontend-pages-di', require('./routes/gap_26_ai_endpoints_exist_but_only_4_frontend_pages_di'));
app.use('/api/gap-no-on-device-private-llm-option-for-sensitive-page', require('./routes/gap_no_on_device_private_llm_option_for_sensitive_page'));
app.use('/api/gap-no-ai-memory-personalization-across-sessions', require('./routes/gap_no_ai_memory_personalization_across_sessions'));
app.use('/api/gap-no-multi-tab-agentic-browsing-flows', require('./routes/gap_no_multi_tab_agentic_browsing_flows'));
app.use('/api/gap-no-actual-browser-extension-build-artifact-chrome-', require('./routes/gap_no_actual_browser_extension_build_artifact_chrome_'));
app.use('/api/gap-no-usage-analytics-quota-tracking-per-user', require('./routes/gap_no_usage_analytics_quota_tracking_per_user'));
app.use('/api/gap-no-subscription-billing-for-paid-tiers', require('./routes/gap_no_subscription_billing_for_paid_tiers'));
app.use('/api/gap-no-team-workspaces-or-shared-library', require('./routes/gap_no_team_workspaces_or_shared_library'));
app.use('/api/gap-no-sync-across-devices', require('./routes/gap_no_sync_across_devices'));
app.use('/api/gap-no-notification-system', require('./routes/gap_no_notification_system'));
app.use('/api/gap-no-webhook-outbound-api', require('./routes/gap_no_webhook_outbound_api'));
