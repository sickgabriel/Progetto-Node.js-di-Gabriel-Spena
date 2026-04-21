/**
 * Utility per standardizzare le risposte dell'API
 */

const ResponseHelper = {
  /**
   * Risposta per errori di validazione o richieste malformate
   */
  badRequest(res, message = 'Richiesta non valida') {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message
      }
    });
  },

  /**
   * Risposta per risorse non trovate
   */
  notFound(res, message = 'Risorsa non trovata') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message
      }
    });
  },

  /**
   * Gestore centralizzato per errori comuni nei controller
   */
  handleControllerError(res, err, next) {
    // Gestione duplicati (DRY)
    if (err.code === 'ER_DUP_ENTRY') {
      let message = 'Record già esistente';
      if (err.message.includes('users.email')) message = 'Email già registrata';
      if (err.message.includes('products.nome')) message = 'Prodotto già esistente';
      
      return this.badRequest(res, message);
    }

    // Passa altri errori al middleware centralizzato
    next(err);
  }
};

module.exports = ResponseHelper;
