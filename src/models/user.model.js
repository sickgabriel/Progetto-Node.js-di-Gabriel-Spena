// Modello Utente: incapsula l'accesso ai dati per la tabella users
// Tutte le query usano Prepared Statements per prevenire SQL Injection
const pool = require('../config/db');

const UserModel = {
  async create({ nome, cognome, email }) {
    const sql = 'INSERT INTO users (nome, cognome, email) VALUES (?, ?, ?)';
    const params = [nome, cognome, email];
    const [result] = await pool.execute(sql, params);
    return { id: result.insertId, nome, cognome, email };
  },

  async findAll() {
    const sql = 'SELECT id, nome, cognome, email, created_at FROM users ORDER BY id DESC';
    const [rows] = await pool.execute(sql);
    return rows;
  },

  async findById(id) {
    const sql = 'SELECT id, nome, cognome, email, created_at FROM users WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  },

  async update(id, { nome, cognome, email }) {
    const sql = 'UPDATE users SET nome = ?, cognome = ?, email = ? WHERE id = ?';
    const params = [nome, cognome, email, id];
    const [result] = await pool.execute(sql, params);
    return result.affectedRows > 0;
  },

  async remove(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }
};

module.exports = UserModel;

