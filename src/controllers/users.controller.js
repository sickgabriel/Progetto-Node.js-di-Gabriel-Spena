// Controller Utenti: contiene la logica di orchestrazione tra HTTP e Model
const User = require('../models/user.model');
const Response = require('../utils/response');

module.exports = {
  // Crea un nuovo utente
  async create(req, res, next) {
    try {
      const { nome, cognome, email } = req.body || {};
      if (!nome || !cognome || !email) {
        return Response.badRequest(res, 'Campi obbligatori mancanti: nome, cognome, email');
      }
      const created = await User.create({ nome, cognome, email });
      return res.status(201).json(created);
    } catch (err) {
      Response.handleControllerError(res, err, next);
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
        return Response.notFound(res, 'Utente non trovato');
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
        return Response.badRequest(res, 'Campi obbligatori mancanti: nome, cognome, email');
      }
      const ok = await User.update(id, { nome, cognome, email });
      if (!ok) {
        return Response.notFound(res, 'Utente non trovato');
      }
      const updated = await User.findById(id);
      return res.json(updated);
    } catch (err) {
      Response.handleControllerError(res, err, next);
    }
  },

  // Elimina un utente
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const ok = await User.remove(id);
      if (!ok) {
        return Response.notFound(res, 'Utente non trovato');
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
