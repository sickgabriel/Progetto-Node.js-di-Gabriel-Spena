🚀 POF: Planty of Food - GAS API
Benvenuti nel backend di Planty of Food (POF). Questo progetto consiste in un set di API JSON RESTful sviluppate in Node.js per la gestione dei Gruppi di Acquisto Solidale (GAS). L'obiettivo è facilitare l'acquisto di prodotti alimentari plant-based, biologici e sostenibili, riducendo l'impatto ambientale tramite ordini collettivi.

🛠️ Tech Stack
Runtime: Node.js

Framework: Express.js

Database: MySQL

Sicurezza: Prepared Statements (SQL Injection Prevention)

Architettura: RESTful

📋 Requisiti del Progetto
Il sistema permette di gestire le tre entità principali del modello GAS:

Prodotti: Gestione del catalogo (Nome prodotto).

Utenti: Anagrafica clienti (Nome, Cognome, Email).

Ordini: Creazione e gestione di ordini collettivi che associano più prodotti a più utenti.

⚙️ Installazione e Configurazione
Segui questi passaggi per avviare il progetto in locale:

1. Clona la repository
Bash
git clone https://github.com/tuo-username/pof-gas-api.git
cd pof-gas-api
2. Installa le dipendenze
Bash
npm install
3. Configura il Database
Crea un database MySQL chiamato pof_db.

Importa il file migrations.sql per creare le tabelle e le relazioni.

Rinomina il file .env.example in .env e inserisci le tue credenziali:

Snippet di codice
DB_HOST=localhost
DB_USER=root
DB_PASS=tua_password
DB_NAME=pof_db
PORT=3000
4. Avvia il server
Bash
npm start
🔌 Documentazione API (Endpoint)
Utenti
GET /api/users - Lista tutti gli utenti.

POST /api/users - Crea un nuovo utente.

PUT /api/users/:id - Modifica un utente.

DELETE /api/users/:id - Elimina un utente.

Prodotti
GET /api/products - Lista tutti i prodotti.

POST /api/products - Aggiunge un prodotto.

PUT /api/products/:id - Modifica un prodotto.

DELETE /api/products/:id - Elimina un prodotto.

Ordini (GAS)
GET /api/orders - Lista tutti gli ordini.

POST /api/orders - Crea un nuovo ordine collettivo.

GET /api/orders?date=YYYY-MM-DD - Filtra ordini per data.

GET /api/orders?product=id_prodotto - Filtra ordini per prodotto contenuto.

🛡️ Sicurezza
Per garantire l'integrità dei dati e la protezione contro attacchi esterni, tutte le query al database sono state implementate utilizzando Prepared Statements tramite la libreria mysql2, neutralizzando il rischio di SQL Injection.
