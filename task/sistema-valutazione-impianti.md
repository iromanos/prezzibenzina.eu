# Task: Sistema di valutazione degli impianti con commento

## Obiettivo

Implementare un sistema che permetta agli utenti di valutare e commentare gli impianti di carburante, migliorando
l'engagement e fornendo dati utili ad altri utenti.

## Dettagli delle Fasi

### Fase 1: Definizione dei Requisiti

- **Dati da raccogliere:**
    - Voto (es. da 1 a 5 stelle).
    - Testo del commento (max 500 caratteri).
    - ID utente (per tracciare chi ha lasciato la recensione).
    - Data e ora della valutazione.
- **Regole di moderazione:**
    - I commenti saranno visibili immediatamente, ma ci sarà un sistema di segnalazione per contenuti inappropriati.
    - Gli amministratori potranno rimuovere i commenti segnalati.
- **Visualizzazione:**
    - Visualizzazione della media delle stelle e del numero totale di recensioni sulla pagina di dettaglio di ogni
      impianto.
    - Elenco dei commenti più recenti con possibilità di paginazione.
- **Funzionalità aggiuntive:**
    - Gli utenti potranno modificare o eliminare solo i propri commenti.
    - Gli utenti potranno segnalare commenti inappropriati.

### Fase 2: Progettazione del Database

- **Tabella `reviews` (o `valutazioni`):**
    - `id` (BIGINT UNSIGNED, PRIMARY KEY, AUTO_INCREMENT)
    - `id_impianto` (BIGINT UNSIGNED, FOREIGN KEY REFERENCES `impianti`(id_impianto))
    - `user_id` (BIGINT UNSIGNED, FOREIGN KEY REFERENCES `users`(id), NULLABLE se si permette recensioni anonime o
      utenti non registrati)
    - `rating` (TINYINT UNSIGNED, NOT NULL, CHECK (rating >= 1 AND rating <= 5))
    - `comment` (TEXT, NULLABLE)
    - `status` (ENUM('pending', 'approved', 'rejected', 'reported'), DEFAULT 'approved')
    - `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
    - `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- **Aggiornamento della tabella `impianti`:**
    - Aggiungere colonne `average_rating` (DECIMAL(3,2), DEFAULT 0.00) e `total_reviews` (INT UNSIGNED, DEFAULT 0).
      Questi campi verranno aggiornati tramite trigger o logica applicativa ogni volta che una recensione viene
      inserita/aggiornata/eliminata.

### Fase 3: Sviluppo API Backend

- **Tecnologia:** Next.js API Routes.
- **Endpoint:**
    - `POST /api/impianti/[id]/reviews`: Crea una nuova recensione per l'impianto specificato. Richiede autenticazione
      utente.
        - Input: `rating`, `comment`.
        - Output: La recensione creata.
    - `GET /api/impianti/[id]/reviews`: Recupera le recensioni per l'impianto specificato. Supporta paginazione e
      filtri (es. `status=approved`).
        - Output: Array di recensioni.
    - `PUT /api/reviews/[review_id]`: Aggiorna una recensione esistente (solo per il proprietario della recensione).
      Richiede autenticazione.
    - `DELETE /api/reviews/[review_id]`: Elimina una recensione esistente (solo per il proprietario della recensione o
      admin). Richiede autenticazione.
    - `POST /api/reviews/[review_id]/report`: Segnala una recensione come inappropriata.
- **Logica di business:**
    - Validazione dei dati in ingresso.
    - Gestione delle transazioni per l'aggiornamento di `average_rating` e `total_reviews` nella tabella `impianti`.
    - Gestione degli errori e risposte HTTP appropriate.

### Fase 4: Sviluppo Frontend

- **Tecnologia:** React Components in Next.js.
- **Pagine interessate:** Pagina di dettaglio dell'impianto.
- **Componenti UI:**
    - `RatingDisplay`: Componente per mostrare la media delle stelle e il numero di recensioni.
    - `ReviewForm`: Form per l'inserimento di nuove recensioni (stelle e campo testo). Visibile solo agli utenti
      autenticati.
    - `ReviewList`: Elenco delle recensioni con nome utente, voto, commento, data. Include pulsanti "Modifica", "
      Elimina" (se utente proprietario) e "Segnala".
- **Integrazione:**
    - Utilizzo di `fetch` o una libreria come `axios` per interagire con le API backend.
    - Gestione dello stato di caricamento, errori e feedback utente.
    - Integrazione con il sistema di autenticazione esistente per mostrare/nascondere funzionalità.

### Fase 5: Test e Deployment

- **Test unitari:**
    - Backend: Test per le funzioni di validazione, logica di database, e gestione degli endpoint API.
    - Frontend: Test per i componenti React (es. con React Testing Library o Jest).
- **Test di integrazione:**
    - Verifica del flusso completo: utente invia recensione -> API la salva -> recensione appare sulla pagina.
- **Test di carico:**
    - Simulazione di un alto numero di richieste per le API di recensione per assicurarsi che il sistema sia scalabile.
- **Deployment:**
    - Processo standard di CI/CD per il rilascio in ambiente di staging e poi in produzione.
    - Monitoraggio delle performance e degli errori post-deployment.
