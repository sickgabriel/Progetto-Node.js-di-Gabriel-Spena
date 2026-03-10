// Middleware di gestione errori centralizzato
// Converte eccezioni in risposte JSON strutturate con status code appropriati
module.exports = function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Errore interno del server';
  if (!err.message) {
    if (code === 'ECONNREFUSED') message = 'Connessione al database rifiutata';
    if (code === 'ER_BAD_DB_ERROR') message = 'Database inesistente o nome errato';
    if (code === 'ER_ACCESS_DENIED_ERROR') message = 'Credenziali DB non valide';
  }
  const details = err.details || undefined;

  if (process.env.NODE_ENV !== 'production') {
    // In ambiente non-prod includiamo dettagli utili al debugging
    return res.status(status).json({ error: { code, message, details } });
  }
  return res.status(status).json({ error: { code, message } });
};
