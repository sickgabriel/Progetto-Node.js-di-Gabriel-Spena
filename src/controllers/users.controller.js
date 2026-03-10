// Controller Utenti: contiene la logica di orchestrazione tra HTTP e Model
const User = require('../models/user.model');

function badRequest(res, message, details) {
  return res.status(400).json({ error: { code: 'BAD_REQUEST', message, details } });
}

module.exports = {
  // Crea un nuovo utente
  async create(req, res, next) {
    try {
      const { nome, cognome, email } = req.body || {};
      if (!nome || !cognome || !email) {
        return badRequest(res, 'Campi obbligatori mancanti: nome, cognome, email');
      }
      const created = await User.create({ nome, cognome, email });
      return res.status(201).json(created);
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Email già registrata';
      }
      next(err);
    }
  },

  // Lista tutti gli utenti
  async list(_req, res, next) {
    try {
      const users = await User.findAll();
      return res.json(users);
    } catch (err) {
      next(err);
    }
  },

  // Recupera utente per ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Utente non trovato' } });
      }
      return res.json(user);
    } catch (err) {
      next(err);
    }
  },

  // Aggiorna un utente
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, cognome, email } = req.body || {};
      if (!nome || !cognome || !email) {
        return badRequest(res, 'Campi obbligatori mancanti: nome, cognome, email');
      }
      const ok = await User.update(id, { nome, cognome, email });
      if (!ok) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Utente non trovato' } });
      }
      const updated = await User.findById(id);
      return res.json(updated);
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Email già registrata';
      }
      next(err);
    }
  },

  // Elimina un utente
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const ok = await User.remove(id);
      if (!ok) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Utente non trovato' } });
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
