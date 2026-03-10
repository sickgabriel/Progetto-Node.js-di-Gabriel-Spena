// Modello Ordine: gestione ordini con partecipanti e items (prodotti)
// Le operazioni di creazione/aggiornamento avvengono in transazione
const pool = require('../config/db');

async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

const OrderModel = {
  async create({ items = [], participants = [] }) {
    return withTransaction(async (conn) => {
      const [orderRes] = await conn.execute('INSERT INTO orders () VALUES ()');
      const orderId = orderRes.insertId;

      // Inserisce items dell'ordine
      for (const it of items) {
        const { productId, quantity } = it;
        await conn.execute(
          'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
          [orderId, productId, quantity || 1]
        );
      }

      // Inserisce partecipanti dell'ordine
      for (const p of participants) {
        const { userId } = p;
        await conn.execute(
          'INSERT INTO order_participants (order_id, user_id) VALUES (?, ?)',
          [orderId, userId]
        );
      }

      return await this.findById(orderId, conn);
    });
  },

  async findAll({ from, to, productId } = {}) {
    // Costruisce query con filtri opzionali
    const params = [];
    let sql = `
      SELECT o.id, o.created_at, o.updated_at
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1 = 1
    `;
    if (from) {
      sql += ' AND o.created_at >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND o.created_at <= ?';
      params.push(to);
    }
    if (productId) {
      sql += ' AND oi.product_id = ?';
      params.push(productId);
    }
    sql += ' GROUP BY o.id ORDER BY o.id DESC';
    const [rows] = await pool.execute(sql, params);
    // Carica dettagli minimi
    return Promise.all(rows.map(r => this.findById(r.id)));
  },

  async findById(id, existingConn = null) {
    const conn = existingConn || pool;
    const [[orderRow]] = await conn.execute(
      'SELECT id, created_at, updated_at FROM orders WHERE id = ?',
      [id]
    );
    if (!orderRow) return null;
    const [items] = await conn.execute(
      `SELECT oi.product_id AS productId, p.nome AS productName, oi.quantity
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [id]
    );
    const [participants] = await conn.execute(
      `SELECT op.user_id AS userId, u.nome, u.cognome, u.email
       FROM order_participants op
        JOIN users u ON u.id = op.user_id
       WHERE op.order_id = ?`,
      [id]
    );
    return { id: orderRow.id, created_at: orderRow.created_at, updated_at: orderRow.updated_at, items, participants };
  },

  async update(id, { items = [], participants = [] }) {
    return withTransaction(async (conn) => {
      // Aggiorna timestamp
      await conn.execute('UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

      // Sostituisce completamente items e participants per semplicità
      await conn.execute('DELETE FROM order_items WHERE order_id = ?', [id]);
      await conn.execute('DELETE FROM order_participants WHERE order_id = ?', [id]);

      for (const it of items) {
        const { productId, quantity } = it;
        await conn.execute(
          'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
          [id, productId, quantity || 1]
        );
      }
      for (const p of participants) {
        const { userId } = p;
        await conn.execute(
          'INSERT INTO order_participants (order_id, user_id) VALUES (?, ?)',
          [id, userId]
        );
      }
      return await this.findById(id, conn);
    });
  },

  async remove(id) {
    return withTransaction(async (conn) => {
      await conn.execute('DELETE FROM order_items WHERE order_id = ?', [id]);
      await conn.execute('DELETE FROM order_participants WHERE order_id = ?', [id]);
      const [res] = await conn.execute('DELETE FROM orders WHERE id = ?', [id]);
      return res.affectedRows > 0;
    });
  }
};

module.exports = OrderModel;

