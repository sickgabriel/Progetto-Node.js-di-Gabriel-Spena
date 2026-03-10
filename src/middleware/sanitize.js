// Middleware di sanitizzazione input
// Scopo: rimuovere caratteri potenzialmente pericolosi da stringhe dell'oggetto req (body, query, params)
// Nota: Le query al DB usano comunque Prepared Statements, questa è una difesa in profondità.
function sanitizeValue(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // Rimuove tag script e sostituisce i caratteri angolari
    return trimmed
      .replace(/<\s*script.*?>.*?<\s*\/\s*script\s*>/gi, '')
      .replace(/[<>]/g, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) {
      out[k] = sanitizeValue(value[k]);
    }
    return out;
  }
  return value;
}

module.exports = function sanitize() {
  return (req, _res, next) => {
    req.body = sanitizeValue(req.body);
    req.params = sanitizeValue(req.params);
    req.query = sanitizeValue(req.query);
    next();
  };
};

