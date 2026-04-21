async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, body: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, body: text }; }
}

const $ = (sel) => document.querySelector(sel);
const fmt = (obj) => typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);

$('#btnHealth').addEventListener('click', async () => {
  const r = await fetchJSON('/api/system/health');
  $('#outHealth').textContent = `[${r.status}] ${fmt(r.body)}`;
});

$('#btnDb').addEventListener('click', async () => {
  const r = await fetchJSON('/api/system/health/db');
  $('#outDb').textContent = `[${r.status}] ${fmt(r.body)}${r.ok ? '' : '\nSuggerimento: avvia MySQL, importa migrations.sql e configura .env.'}`;
});

$('#formUser').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const r = await fetchJSON('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  $('#outUser').textContent = `[${r.status}] ${fmt(r.body)}`;
});

$('#formProduct').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const r = await fetchJSON('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  $('#outProduct').textContent = `[${r.status}] ${fmt(r.body)}`;
});

$('#btnUsers').addEventListener('click', async () => {
  const r = await fetchJSON('/api/users');
  $('#outUsers').textContent = `[${r.status}] ${fmt(r.body)}`;
});

$('#btnProducts').addEventListener('click', async () => {
  const r = await fetchJSON('/api/products');
  $('#outProducts').textContent = `[${r.status}] ${fmt(r.body)}`;
});

$('#formOrder').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const productId = parseInt(fd.get('productId'), 10);
  const quantity = parseInt(fd.get('quantity'), 10) || 1;
  const userId = parseInt(fd.get('userId'), 10);
  const payload = { items: [{ productId, quantity }], participants: [{ userId }] };
  const r = await fetchJSON('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  $('#outOrder').textContent = `[${r.status}] ${fmt(r.body)}`;
});

