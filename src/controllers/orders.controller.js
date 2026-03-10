// Controller Ordini: crea, legge, aggiorna e cancella ordini
// Supporta filtri per data di inserimento e per prodotto contenuto
const Orders = require('../models/order.model');

function badRequest(res, message, details) {
  return res.status(400).json({ error: { code: 'BAD_REQUEST', message, details } });
}

function isValidItems(items) {
  return Array.isArray(items) && items.every(it => it && Number.isInteger(it.productId) && (it.quantity === undefined || Number.isInteger(it.quantity)));
}

function isValidParticipants(participants) {
  return Array.isArray(participants) && participants.every(p => p && Number.isInteger(p.userId));
}

module.exports = {
  // Crea un nuovo ordine con items e partecipanti
  async create(req, res, next) {
    try {
      const { items, participants } = req.body || {};
      if (!isValidItems(items) || !isValidParticipants(participants)) {
        return badRequest(res, 'Payload non valido: items[{productId, quantity}], participants[{userId}]');
      }
      const created = await Orders.create({ items, participants });
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  // Lista ordini con filtri opzionali: from, to (YYYY-MM-DD), productId
  async list(req, res, next) {
    try {
      const { from, to, productId } = req.query || {};
      const filters = {};
      if (from) filters.from = from;
      if (to) filters.to = to;
      if (productId && /^\d+$/.test(String(productId))) filters.productId = Number(productId);
      const orders = await Orders.findAll(filters);
      return res.json(orders);
    } catch (err) {
      next(err);
    }
  },

  // Dettaglio ordine
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Orders.findById(id);
      if (!order) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ordine non trovato' } });
      }
      return res.json(order);
    } catch (err) {
      next(err);
    }
  },

  // Aggiorna l'ordine sostituendo items e partecipanti
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { items, participants } = req.body || {};
      if (!isValidItems(items) || !isValidParticipants(participants)) {
        return badRequest(res, 'Payload non valido: items[{productId, quantity}], participants[{userId}]');
      }
      const found = await Orders.findById(id);
      if (!found) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ordine non trovato' } });
      }
      const updated = await Orders.update(Number(id), { items, participants });
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  // Cancella un ordine
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const ok = await Orders.remove(id);
      if (!ok) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ordine non trovato' } });
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};

