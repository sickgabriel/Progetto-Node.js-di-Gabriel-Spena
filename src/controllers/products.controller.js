// Controller Prodotti: gestisce le operazioni CRUD per i prodotti
const Product = require('../models/product.model');

function badRequest(res, message, details) {
  return res.status(400).json({ error: { code: 'BAD_REQUEST', message, details } });
}

module.exports = {
  async create(req, res, next) {
    try {
      const { nome } = req.body || {};
      if (!nome) {
        return badRequest(res, 'Campo obbligatorio mancante: nome');
      }
      const created = await Product.create({ nome });
      return res.status(201).json(created);
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Prodotto già esistente';
      }
      next(err);
    }
  },

  async list(_req, res, next) {
    try {
      const items = await Product.findAll();
      return res.json(items);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const prod = await Product.findById(id);
      if (!prod) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Prodotto non trovato' } });
      }
      return res.json(prod);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nome } = req.body || {};
      if (!nome) {
        return badRequest(res, 'Campo obbligatorio mancante: nome');
      }
      const ok = await Product.update(id, { nome });
      if (!ok) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Prodotto non trovato' } });
      }
      const updated = await Product.findById(id);
      return res.json(updated);
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Prodotto già esistente';
      }
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const ok = await Product.remove(id);
      if (!ok) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Prodotto non trovato' } });
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
