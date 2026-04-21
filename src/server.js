// Avvio del server HTTP
// Carica le variabili d'ambiente e avvia l'app Express
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Planty of Food API in ascolto sulla porta ${PORT}`);
});

