// Controller Ordini: crea, legge, aggiorna e cancella ordini
// Supporta filtri per data di inserimento e per prodotto contenuto
const Orders = require('../models/order.model');
const Response = require('../utils/response');

/**
 * Validazione semantica degli items (prodotti) dell'ordine - Punto 5
 */
function isValidItems(items) {
  if (!Array.isArray(items) || items.length === 0) return false;
  
  return items.every(it => {
    const hasValidProductId = it && Number.isInteger(it.productId) && it.productId > 0;
    // La quantità deve essere un intero positivo (> 0) - Punto 5
    const hasValidQuantity = it && (it.quantity === undefined || (Number.isInteger(it.quantity) && it.quantity > 0));
    return hasValidProductId && hasValidQuantity;
  });
}

/**
 * Validazione semantica dei partecipanti dell'ordine - Punto 5
 */
function isValidParticipants(participants) {
  if (!Array.isArray(participants) || participants.length === 0) return false;
  
  return participants.every(p => p && Number.isInteger(p.userId) && p.userId > 0);
}

module.exports = {
  // Crea un nuovo ordine con items e partecipanti
  async create(req, res, next) {
    try {
      const { items, participants } = req.body || {};
      
      if (!isValidItems(items)) {
        return Response.badRequest(res, 'Items non validi: deve essere un array non vuoto con productId > 0 e quantity > 0');
      }
      
      if (!isValidParticipants(participants)) {
        return Response.badRequest(res, 'Partecipanti non validi: deve essere un array non vuoto con userId > 0');
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
        return Response.notFound(res, 'Ordine non trovato');
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
        return Response.badRequest(res, 'Payload non valido: items e participants devono essere array non vuoti con ID e quantità positive');
      }
      
      const found = await Orders.findById(id);
      if (!found) {
        return Response.notFound(res, 'Ordine non trovato');
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
        return Response.notFound(res, 'Ordine non trovato');
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
