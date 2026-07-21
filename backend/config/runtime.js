'use strict';
function validateRuntime(env = process.env) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  if (env.NODE_ENV === 'production' && !env.DB_PASSWORD && !env.DATABASE_URL) throw new Error('Production database credentials are required');
  if (env.NODE_ENV === 'production' && String(env.ALLOW_DEMO_AUTH).toLowerCase() === 'true') throw new Error('Demo authentication cannot be enabled in production');
  return true;
}
module.exports = { validateRuntime };
