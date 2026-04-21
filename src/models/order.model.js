// Modello Ordine: gestione ordini con partecipanti e items (prodotti)
// Le operazioni di creazione/aggiornamento avvengono in transazione
const pool = require('../config/db');
const { isMock, enableMock } = require('../config/runtime');
const mock = require('./mock.store');

async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      // Non oscuriamo l'errore originale se il rollback fallisce - SRP punto 7
      console.error('Errore durante il rollback della transazione:', rollbackErr);
    }
    throw err;
  } finally {
    connection.release();
  }
}

const OrderModel = {
  async create({ items = [], participants = [] }) {
    if (isMock()) return mock.createOrder({ items, participants });
    try {
      return withTransaction(async (conn) => {
        const [orderRes] = await conn.execute('INSERT INTO orders () VALUES ()');
        const orderId = orderRes.insertId;
        for (const it of items) {
          const { productId, quantity } = it;
          await conn.execute(
            'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
            [orderId, productId, quantity || 1]
          );
        }
        for (const p of participants) {
          const { userId } = p;
          await conn.execute(
            'INSERT INTO order_participants (order_id, user_id) VALUES (?, ?)',
            [orderId, userId]
          );
        }
        return await this.findById(orderId, conn);
      });
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.createOrder({ items, participants });
      }
      throw e;
    }
  },

  async findAll({ from, to, productId } = {}) {
    if (isMock()) return mock.listOrders({ from, to, productId });

    // Costruisce query con filtri opzionali - SRP punto 4
    const params = [];
    let sql = 'SELECT id, created_at, updated_at FROM orders WHERE 1 = 1';
    
    if (from) {
      sql += ' AND created_at >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND created_at <= ?';
      params.push(to);
    }
    if (productId) {
      // Usa subquery invece di JOIN per filtrare - SRP punto 4
      sql += ' AND id IN (SELECT order_id FROM order_items WHERE product_id = ?)';
      params.push(productId);
    }
    
    sql += ' ORDER BY id DESC';

    try {
      const [rows] = await pool.execute(sql, params);
      // Carica dettagli completi per ogni ordine
      return Promise.all(rows.map(r => this.findById(r.id)));
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.listOrders({ from, to, productId });
      }
      throw e;
    }
  },

  async findById(id, existingConn = null) {
    if (isMock()) return mock.getOrder(id);
    try {
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
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.getOrder(id);
      }
      throw e;
    }
  },

  async update(id, { items = [], participants = [] }) {
    if (isMock()) return mock.updateOrder(id, { items, participants });
    try {
      return withTransaction(async (conn) => {
        await conn.execute('UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
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
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.updateOrder(id, { items, participants });
      }
      throw e;
    }
  },

  async remove(id) {
    if (isMock()) return mock.deleteOrder(id);
    try {
      // Nota: Grazie a ON DELETE CASCADE nello schema SQL (migrations.sql),
      // non serve cancellare manualmente items e participants. Punto 3 - SRP.
      const [res] = await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } catch (e) {
      if (e && (e.code === 'ECONNREFUSED' || e.code === 'ER_BAD_DB_ERROR' || e.code === 'ER_ACCESS_DENIED_ERROR')) {
        enableMock();
        return mock.deleteOrder(id);
      }
      throw e;
    }
  }
};

module.exports = OrderModel;
