const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { sequelize, User } = require('../models');
const { DataTypes } = require('sequelize');

// ---- Models (inline, auto-created via sync) ----

const ApiKey = sequelize.define('ApiKey', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  keyHash: { type: DataTypes.STRING, allowNull: false, unique: true },
  keyPrefix: { type: DataTypes.STRING, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastUsedAt: { type: DataTypes.DATE },
}, { tableName: 'api_keys', timestamps: true });

const AiUsageLog = sequelize.define('AiUsageLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  endpoint: { type: DataTypes.STRING },
  tokensUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
  estimatedCostUsd: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { tableName: 'ai_usage_logs', timestamps: true });

const UserQuota = sequelize.define('UserQuota', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  dailyLimit: { type: DataTypes.INTEGER, defaultValue: 50 },
  monthlyLimit: { type: DataTypes.INTEGER, defaultValue: 500 },
}, { tableName: 'user_quotas', timestamps: true });

// Sync tables on startup
(async () => {
  try {
    await ApiKey.sync({ alter: false });
    await AiUsageLog.sync({ alter: false });
    await UserQuota.sync({ alter: false });
  } catch (e) {
    // Tables may already exist with compatible schema
    try {
      await ApiKey.sync();
      await AiUsageLog.sync();
      await UserQuota.sync();
    } catch (e2) {
      console.error('User model sync error:', e2.message);
    }
  }
})();

module.exports.ApiKey = ApiKey;
module.exports.AiUsageLog = AiUsageLog;
module.exports.UserQuota = UserQuota;

// POST /api/user/api-key - generate a new personal API key
router.post('/api-key', async (req, res) => {
  try {
    const userId = req.user.id;

    // Deactivate any existing active keys
    await ApiKey.update({ isActive: false }, { where: { userId, isActive: true } });

    // Generate a new key
    const rawKey = 'ext_' + crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 12);

    await ApiKey.create({ userId, keyHash, keyPrefix });

    res.json({
      success: true,
      api_key: rawKey,
      prefix: keyPrefix,
      message: 'Store this key securely — it will not be shown again.',
    });
  } catch (err) {
    console.error('Error generating API key:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/api-key - list active keys (prefix only, never raw)
router.get('/api-key', async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'keyPrefix', 'isActive', 'lastUsedAt', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/user/api-key/:id - revoke a key
router.delete('/api-key/:id', async (req, res) => {
  try {
    const key = await ApiKey.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!key) return res.status(404).json({ error: 'Key not found' });
    await key.update({ isActive: false });
    res.json({ success: true, message: 'API key revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/usage-stats - AI request stats
router.get('/usage-stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayRows] = await sequelize.query(
      `SELECT COUNT(*) as count, COALESCE(SUM("tokensUsed"), 0) as tokens, COALESCE(SUM("estimatedCostUsd"), 0) as cost
       FROM ai_usage_logs WHERE "userId" = :userId AND "createdAt" >= :start`,
      { replacements: { userId, start: startOfDay }, type: sequelize.QueryTypes.SELECT }
    );

    const [monthRows] = await sequelize.query(
      `SELECT COUNT(*) as count, COALESCE(SUM("tokensUsed"), 0) as tokens, COALESCE(SUM("estimatedCostUsd"), 0) as cost
       FROM ai_usage_logs WHERE "userId" = :userId AND "createdAt" >= :start`,
      { replacements: { userId, start: startOfMonth }, type: sequelize.QueryTypes.SELECT }
    );

    const endpointRows = await sequelize.query(
      `SELECT endpoint, COUNT(*) as count FROM ai_usage_logs
       WHERE "userId" = :userId AND "createdAt" >= :start GROUP BY endpoint ORDER BY count DESC LIMIT 10`,
      { replacements: { userId, start: startOfMonth }, type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      today: {
        requests: parseInt(todayRows.count) || 0,
        tokens_used: parseInt(todayRows.tokens) || 0,
        estimated_cost_usd: parseFloat(todayRows.cost || 0).toFixed(4),
      },
      this_month: {
        requests: parseInt(monthRows.count) || 0,
        tokens_used: parseInt(monthRows.tokens) || 0,
        estimated_cost_usd: parseFloat(monthRows.cost || 0).toFixed(4),
      },
      top_endpoints: endpointRows,
    });
  } catch (err) {
    console.error('Error fetching usage stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/quota - quota info
router.get('/quota', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get or create quota record
    let [quota] = await UserQuota.findOrCreate({
      where: { userId },
      defaults: { userId, dailyLimit: 50, monthlyLimit: 500 },
    });

    const [dailyUsed] = await sequelize.query(
      `SELECT COUNT(*) as count FROM ai_usage_logs WHERE "userId" = :userId AND "createdAt" >= :start`,
      { replacements: { userId, start: startOfDay }, type: sequelize.QueryTypes.SELECT }
    );

    const [monthlyUsed] = await sequelize.query(
      `SELECT COUNT(*) as count FROM ai_usage_logs WHERE "userId" = :userId AND "createdAt" >= :start`,
      { replacements: { userId, start: startOfMonth }, type: sequelize.QueryTypes.SELECT }
    );

    // Calculate resets_at (start of next day)
    const tomorrow = new Date(startOfDay);
    tomorrow.setDate(tomorrow.getDate() + 1);

    res.json({
      success: true,
      daily_limit: quota.dailyLimit,
      daily_used: parseInt(dailyUsed.count) || 0,
      daily_remaining: Math.max(0, quota.dailyLimit - (parseInt(dailyUsed.count) || 0)),
      monthly_limit: quota.monthlyLimit,
      monthly_used: parseInt(monthlyUsed.count) || 0,
      monthly_remaining: Math.max(0, quota.monthlyLimit - (parseInt(monthlyUsed.count) || 0)),
      resets_at: tomorrow.toISOString(),
    });
  } catch (err) {
    console.error('Error fetching quota:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
