const state = {
  counters: { users: 0, products: 0, orders: 0 },
  users: [],
  products: [],
  orders: [] // { id, created_at, updated_at, items: [{productId, quantity}], participants: [{userId}] }
};

function now() { return new Date().toISOString().slice(0, 19).replace('T', ' '); }

// Users
function createUser({ nome, cognome, email }) {
  if (state.users.find(u => u.email === email)) {
    const err = new Error('Email già registrata'); err.code = 'ER_DUP_ENTRY'; throw err;
  }
  const id = ++state.counters.users;
  const u = { id, nome, cognome, email, created_at: now() };
  state.users.push(u);
  return u;
}
const listUsers = () => [...state.users].sort((a,b)=>b.id-a.id);
const getUser = (id) => state.users.find(u => u.id === Number(id)) || null;
function updateUser(id, { nome, cognome, email }) {
  const u = getUser(id); if (!u) return false;
  if (email && state.users.some(x => x.email === email && x.id !== Number(id))) {
    const err = new Error('Email già registrata'); err.code = 'ER_DUP_ENTRY'; throw err;
  }
  u.nome = nome; u.cognome = cognome; u.email = email; return true;
}
function deleteUser(id) {
  const i = state.users.findIndex(u=>u.id===Number(id));
  if (i<0) return false; state.users.splice(i,1); return true;
}

// Products
function createProduct({ nome }) {
  if (state.products.find(p => p.nome === nome)) {
    const err = new Error('Prodotto già esistente'); err.code = 'ER_DUP_ENTRY'; throw err;
  }
  const id = ++state.counters.products;
  const p = { id, nome, created_at: now() };
  state.products.push(p);
  return p;
}
const listProducts = () => [...state.products].sort((a,b)=>b.id-a.id);
const getProduct = (id) => state.products.find(p => p.id === Number(id)) || null;
function updateProduct(id, { nome }) {
  const p = getProduct(id); if (!p) return false;
  if (nome && state.products.some(x => x.nome === nome && x.id !== Number(id))) {
    const err = new Error('Prodotto già esistente'); err.code = 'ER_DUP_ENTRY'; throw err;
  }
  p.nome = nome; return true;
}
function deleteProduct(id) {
  const i = state.products.findIndex(p=>p.id===Number(id));
  if (i<0) return false; state.products.splice(i,1); return true;
}

// Orders
function createOrder({ items = [], participants = [] }) {
  // validazioni base
  for (const it of items) {
    if (!getProduct(it.productId)) { const e = new Error('Prodotto inesistente'); e.code='ER_NO_REFERENCED_ROW'; throw e; }
  }
  for (const p of participants) {
    if (!getUser(p.userId)) { const e = new Error('Utente inesistente'); e.code='ER_NO_REFERENCED_ROW'; throw e; }
  }
  const id = ++state.counters.orders;
  const o = { id, created_at: now(), updated_at: null, items: items.map(x=>({productId:Number(x.productId), quantity: x.quantity||1})), participants: participants.map(x=>({userId:Number(x.userId)})) };
  state.orders.push(o);
  return getOrder(id);
}
function listOrders({ from, to, productId } = {}) {
  let arr = [...state.orders];
  if (from) arr = arr.filter(o => o.created_at >= from);
  if (to) arr = arr.filter(o => o.created_at <= to);
  if (productId) arr = arr.filter(o => o.items.some(i => i.productId === Number(productId)));
  return arr.sort((a,b)=>b.id-a.id).map(o => getOrder(o.id));
}
function getOrder(id) {
  const o = state.orders.find(o=>o.id===Number(id));
  if (!o) return null;
  const items = o.items.map(it => {
    const p = getProduct(it.productId);
    return { productId: it.productId, productName: p ? p.nome : null, quantity: it.quantity };
  });
  const participants = o.participants.map(p => {
    const u = getUser(p.userId);
    return u ? { userId: u.id, nome: u.nome, cognome: u.cognome, email: u.email } : { userId: p.userId };
  });
  return { id: o.id, created_at: o.created_at, updated_at: o.updated_at, items, participants };
}
function updateOrder(id, { items = [], participants = [] }) {
  const o = state.orders.find(o=>o.id===Number(id));
  if (!o) return null;
  for (const it of items) if (!getProduct(it.productId)) { const e = new Error('Prodotto inesistente'); e.code='ER_NO_REFERENCED_ROW'; throw e; }
  for (const p of participants) if (!getUser(p.userId)) { const e = new Error('Utente inesistente'); e.code='ER_NO_REFERENCED_ROW'; throw e; }
  o.items = items.map(x=>({productId:Number(x.productId), quantity: x.quantity||1}));
  o.participants = participants.map(x=>({userId:Number(x.userId)}));
  o.updated_at = now();
  return getOrder(id);
}
function deleteOrder(id) {
  const i = state.orders.findIndex(o=>o.id===Number(id));
  if (i<0) return false; state.orders.splice(i,1); return true;
}

module.exports = {
  // users
  createUser, listUsers, getUser, updateUser, deleteUser,
  // products
  createProduct, listProducts, getProduct, updateProduct, deleteProduct,
  // orders
  createOrder, listOrders, getOrder, updateOrder, deleteOrder
};

