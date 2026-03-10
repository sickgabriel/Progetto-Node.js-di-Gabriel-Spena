# Planty of Food API (POF)

Backend API RESTful per la gestione dei Gruppi di Acquisto Solidale (GAS) con Node.js, Express e MySQL.

## Requisiti
- Node.js >= 18
- MySQL 8.x

## Setup
1. Clona il progetto o copia i file nella cartella desiderata.
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Crea un database MySQL (es. `pof`) e importa lo schema:
   - Apri il tuo client MySQL (phpMyAdmin, MySQL Workbench, ecc.)
   - Esegui il file `migrations.sql`
4. Configura l'ambiente:
   - Copia `.env.example` in `.env` e imposta i dati di connessione al DB
5. Avvia il server:
   ```bash
   npm start
   ```
   L'API sarà in ascolto su `http://localhost:3000` (o sulla porta definita in `PORT`).

## Struttura Cartelle
```
src/
  config/        # connessione MySQL (mysql2/promise)
  controllers/   # logica di business per ogni risorsa
  middleware/    # sanitizzazione input e gestione errori
  models/        # accesso ai dati con Prepared Statements
  routes/        # definizione delle rotte REST
  app.js         # configurazione Express
  server.js      # bootstrap server
```

## Sicurezza
- Tutte le query al DB utilizzano Prepared Statements (placeholders `?`) con `mysql2`.
- Middleware di sanitizzazione per body, query e params.
- CORS abilitato.

## Endpoints
Prefisso: `/api`

### Utenti
- POST `/api/users`
  - Body:
    ```json
    { "nome": "Mario", "cognome": "Rossi", "email": "mario.rossi@example.com" }
    ```
  - 201 Created -> oggetto utente
- GET `/api/users` -> lista utenti
- GET `/api/users/:id` -> dettaglio utente
- PUT `/api/users/:id`
  - Body:
    ```json
    { "nome": "Mario", "cognome": "Verdi", "email": "mario.verdi@example.com" }
    ```
  - 200 OK -> utente aggiornato
- DELETE `/api/users/:id` -> 204 No Content

### Prodotti
- POST `/api/products`
  - Body:
    ```json
    { "nome": "Tofu Bio" }
    ```
  - 201 Created -> oggetto prodotto
- GET `/api/products` -> lista prodotti
- GET `/api/products/:id` -> dettaglio prodotto
- PUT `/api/products/:id`
  - Body:
    ```json
    { "nome": "Tempeh Bio" }
    ```
  - 200 OK -> prodotto aggiornato
- DELETE `/api/products/:id` -> 204 No Content

### Ordini
- POST `/api/orders`
  - Body:
    ```json
    {
      "items": [
        { "productId": 1, "quantity": 2 },
        { "productId": 2, "quantity": 1 }
      ],
      "participants": [
        { "userId": 1 },
        { "userId": 2 }
      ]
    }
    ```
  - 201 Created -> ordine con items e partecipanti
- GET `/api/orders`
  - Query facoltative:
    - `from=YYYY-MM-DD`
    - `to=YYYY-MM-DD`
    - `productId=<id>`
  - 200 OK -> lista ordini (ognuno con items e partecipanti)
- GET `/api/orders/:id` -> dettaglio ordine
- PUT `/api/orders/:id`
  - Body (sostituisce items e partecipanti):
    ```json
    {
      "items": [{ "productId": 1, "quantity": 3 }],
      "participants": [{ "userId": 1 }]
    }
    ```
  - 200 OK -> ordine aggiornato
- DELETE `/api/orders/:id` -> 204 No Content

## Note
- Non sono richiesti ulteriori passaggi manuali oltre alla creazione del DB, import dello schema e configurazione del file `.env`.

