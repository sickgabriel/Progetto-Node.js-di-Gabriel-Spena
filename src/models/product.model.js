// Modello Prodotto: gestione CRUD per la tabella products
const pool = require('../config/db');

const ProductModel = {
  async create({ nome }) {
    const sql = 'INSERT INTO products (nome) VALUES (?)';
    const [result] = await pool.execute(sql, [nome]);
    return { id: result.insertId, nome };
    },

  async findAll() {
    const sql = 'SELECT id, nome, created_at FROM products ORDER BY id DESC';
    const [rows] = await pool.execute(sql);
    return rows;
  },

  async findById(id) {
    const sql = 'SELECT id, nome, created_at FROM products WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  },

  async update(id, { nome }) {
    const sql = 'UPDATE products SET nome = ? WHERE id = ?';
    const [result] = await pool.execute(sql, [nome, id]);
    return result.affectedRows > 0;
  },

  async remove(id) {
    const sql = 'DELETE FROM products WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ProductModel;

