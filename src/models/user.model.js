// Modello Utente: incapsula l'accesso ai dati per la tabella users
// Tutte le query usano Prepared Statements per prevenire SQL Injection
const pool = require('../config/db');
const { isMock, enableMock } = require('../config/runtime');
const mock = require('./mock.store');

const UserModel = {
  async create({ nome, cognome, email }) {
    if (isMock()) return mock.createUser({ nome, cognome, email });
    try {
      const sql = 'INSERT INTO users (nome, cognome, email) VALUES (?, ?, ?)';
      const params = [nome, cognome, email];
      const [result] = await pool.execute(sql, params);
      return { id: result.insertId, nome, cognome, email };
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.createUser({ nome, cognome, email });
      }
      throw e;
    }
  },

  async findAll() {
    if (isMock()) return mock.listUsers();
    try {
      const sql = 'SELECT id, nome, cognome, email, created_at FROM users ORDER BY id DESC';
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.listUsers();
      }
      throw e;
    }
  },

  async findById(id) {
    if (isMock()) return mock.getUser(id);
    try {
      const sql = 'SELECT id, nome, cognome, email, created_at FROM users WHERE id = ?';
      const [rows] = await pool.execute(sql, [id]);
      return rows[0] || null;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.getUser(id);
      }
      throw e;
    }
  },

  async update(id, { nome, cognome, email }) {
    if (isMock()) return mock.updateUser(id, { nome, cognome, email });
    try {
      const sql = 'UPDATE users SET nome = ?, cognome = ?, email = ? WHERE id = ?';
      const params = [nome, cognome, email, id];
      const [result] = await pool.execute(sql, params);
      return result.affectedRows > 0;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.updateUser(id, { nome, cognome, email });
      }
      throw e;
    }
  },

  async remove(id) {
    if (isMock()) return mock.deleteUser(id);
    try {
      const sql = 'DELETE FROM users WHERE id = ?';
      const [result] = await pool.execute(sql, [id]);
      return result.affectedRows > 0;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.deleteUser(id);
      }
      throw e;
    }
  }
};

module.exports = UserModel;
