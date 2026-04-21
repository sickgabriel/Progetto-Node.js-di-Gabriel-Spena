// Middleware di gestione errori centralizzato
// Converte eccezioni in risposte JSON strutturate con status code appropriati
module.exports = function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Errore interno del server';

  // Gestione errori specifici del Database (mysql2)
  if (code === 'ECONNREFUSED') {
    message = 'Connessione al database rifiutata';
    statusCode = 503;
  } else if (code === 'ER_BAD_DB_ERROR') {
    message = 'Database inesistente o nome errato nel .env';
    statusCode = 500;
  } else if (code === 'ER_ACCESS_DENIED_ERROR') {
    message = 'Credenziali database non valide';
    statusCode = 403;
  } else if (code === 'ER_DUP_ENTRY') {
    // Questo solitamente viene gestito nel controller, ma lo lasciamo come fallback
    message = 'Valore duplicato nel database';
    statusCode = 400;
  }

  const details = err.details || undefined;

  if (process.env.NODE_ENV !== 'production') {
    // In ambiente non-prod includiamo dettagli utili al debugging
    return res.status(statusCode).json({ error: { code, message, details } });
  }
  return res.status(statusCode).json({ error: { code, message } });
};
