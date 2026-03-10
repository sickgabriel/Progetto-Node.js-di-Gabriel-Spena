// Configurazione dell'app Express
// In questo file configuriamo middleware base, CORS, parsing JSON e rotte dell'applicazione.
const express = require('express');
const cors = require('cors');

// Middleware personalizzati (saranno implementati nella fase successiva)
const sanitize = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/db');

// Rotte (verranno create nelle fasi successive)
const usersRouter = require('./routes/users.routes');
const productsRouter = require('./routes/products.routes');
const ordersRouter = require('./routes/orders.routes');

const app = express();

// Abilita CORS per tutte le origini (configurabile)
app.use(cors());

// Parsing del corpo delle richieste in JSON
app.use(express.json({ limit: '1mb' }));

// Middleware di sanitizzazione per ridurre rischi XSS/Injection lato input
app.use(sanitize());

// Homepage e healthcheck per facilitare il test in browser
app.get('/', (_req, res) => {
  res.json({
    name: 'Planty of Food API',
    version: '1.0.0',
    health: '/api/health',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/health/db', async (_req, res, next) => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    err.statusCode = 500;
    err.code = err.code || 'DB_ERROR';
    next(err);
  }
});

// Prefisso API
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Middleware di gestione errori centralizzato
app.use(errorHandler);

module.exports = app;
