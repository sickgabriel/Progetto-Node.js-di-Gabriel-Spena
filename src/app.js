// Configurazione dell'app Express
// In questo file configuriamo middleware base, CORS, parsing JSON e rotte dell'applicazione.
const express = require('express');
const cors = require('cors');
const path = require('path');

// Middleware personalizzati (saranno implementati nella fase successiva)
const sanitize = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/db');
const { isMock } = require('./config/runtime');

// Rotte
const usersRouter = require('./routes/users.routes');
const productsRouter = require('./routes/products.routes');
const ordersRouter = require('./routes/orders.routes');
const systemRouter = require('./routes/system.routes');

const app = express();

// Abilita CORS per tutte le origini (configurabile)
app.use(cors());

// Serve file statici dalla cartella public
app.use(express.static('public'));

// Parsing del corpo delle richieste in JSON
app.use(express.json({ limit: '1mb' }));

// Middleware di sanitizzazione per ridurre rischi XSS/Injection lato input
app.use(sanitize());

// Montaggio Rotte
app.use('/', systemRouter); // Homepage e system endpoints
app.use('/api/system', systemRouter); // Alias per chiarezza
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Handler per rotte non trovate (404 JSON) - SRP punto 8
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint non trovato'
    }
  });
});

// Middleware di gestione errori centralizzato
app.use(errorHandler);

module.exports = app;
