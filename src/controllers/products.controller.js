// Controller Prodotti: gestisce le operazioni CRUD per i prodotti
const Product = require('../models/product.model');
const Response = require('../utils/response');

module.exports = {
  async create(req, res, next) {
    try {
      const { nome } = req.body || {};
      if (!nome) {
        return Response.badRequest(res, 'Campo obbligatorio mancante: nome');
      }
      const created = await Product.create({ nome });
      return res.status(201).json(created);
    } catch (err) {
      Response.handleControllerError(res, err, next);
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
        return Response.notFound(res, 'Prodotto non trovato');
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
        return Response.badRequest(res, 'Campo obbligatorio mancante: nome');
      }
      const ok = await Product.update(id, { nome });
      if (!ok) {
        return Response.notFound(res, 'Prodotto non trovato');
      }
      const updated = await Product.findById(id);
      return res.json(updated);
    } catch (err) {
      Response.handleControllerError(res, err, next);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const ok = await Product.remove(id);
      if (!ok) {
        return Response.notFound(res, 'Prodotto non trovato');
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
