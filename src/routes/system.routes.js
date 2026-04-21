const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const RuntimeConfig = require('../config/runtime');

// Homepage informativa
router.get('/', (_req, res) => {
  res.json({
    name: 'Planty of Food API',
    version: '1.0.0',
    health: '/api/system/health',
    db_status: '/api/system/health/db',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});

// Healthcheck base
router.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Healthcheck DB
router.get('/health/db', async (_req, res, next) => {
  try {
    if (RuntimeConfig.isMockEnabled()) {
      return res.json({ status: 'ok', db: 'mock' });
    }
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    err.statusCode = 503; // Service Unavailable è più appropriato
    next(err);
  }
});

module.exports = router;
