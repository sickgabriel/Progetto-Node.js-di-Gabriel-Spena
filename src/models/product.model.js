// Modello Prodotto: gestione CRUD per la tabella products
const pool = require('../config/db');
const { isMock, enableMock } = require('../config/runtime');
const mock = require('./mock.store');

const ProductModel = {
  async create({ nome }) {
    if (isMock()) return mock.createProduct({ nome });
    try {
      const sql = 'INSERT INTO products (nome) VALUES (?)';
      const [result] = await pool.execute(sql, [nome]);
      return { id: result.insertId, nome };
      } catch (e) {
        if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
          enableMock();
          return mock.createProduct({ nome });
        }
        throw e;
      }
    },

  async findAll() {
    if (isMock()) return mock.listProducts();
    try {
      const sql = 'SELECT id, nome, created_at FROM products ORDER BY id DESC';
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.listProducts();
      }
      throw e;
    }
  },

  async findById(id) {
    if (isMock()) return mock.getProduct(id);
    try {
      const sql = 'SELECT id, nome, created_at FROM products WHERE id = ?';
      const [rows] = await pool.execute(sql, [id]);
      return rows[0] || null;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.getProduct(id);
      }
      throw e;
    }
  },

  async update(id, { nome }) {
    if (isMock()) return mock.updateProduct(id, { nome });
    try {
      const sql = 'UPDATE products SET nome = ? WHERE id = ?';
      const [result] = await pool.execute(sql, [nome, id]);
      return result.affectedRows > 0;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.updateProduct(id, { nome });
      }
      throw e;
    }
  },

  async remove(id) {
    if (isMock()) return mock.deleteProduct(id);
    try {
      const sql = 'DELETE FROM products WHERE id = ?';
      const [result] = await pool.execute(sql, [id]);
      return result.affectedRows > 0;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.deleteProduct(id);
      }
      throw e;
    }
  }
};

module.exports = ProductModel;
