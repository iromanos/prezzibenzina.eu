# Task Breakdown: Proposta 1 - Sistema di Notifiche Prezzi

Questo documento scompone in passaggi concreti l'implementazione del "Sistema di Notifiche Prezzi" per PrezziBenzina.eu.

## Fase 1: Backend - Gestione Utenti e Sottoscrizioni

L'obiettivo di questa fase è creare l'infrastruttura per la gestione degli utenti e delle loro preferenze di notifica.

1. **Definizione Schema Database per Utenti:**
    * Creare una nuova tabella `users` per memorizzare le informazioni di base degli utenti.
    * **Campi proposti:**
        * `id` (Primary Key, UUID o INT AUTO_INCREMENT)
        * `email` (VARCHAR, UNIQUE, NOT NULL)
        * `password_hash` (VARCHAR, NOT NULL)
        * `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
        * `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
        * `is_verified` (BOOLEAN, DEFAULT FALSE) - per verifica email
        * `verification_token` (VARCHAR, NULL) - per verifica email
        * `reset_password_token` (VARCHAR, NULL) - per reset password
        * `reset_password_expires` (DATETIME, NULL)
2. **Definizione Schema Database per Sottoscrizioni Notifiche:**
    * Creare una nuova tabella `price_subscriptions` per memorizzare le preferenze di notifica degli utenti.
    * **Campi proposti:**
        * `id` (Primary Key, UUID o INT AUTO_INCREMENT)
        * `user_id` (Foreign Key a `users.id`, NOT NULL)
        * `fuel_type` (VARCHAR, es. 'Benzina', 'Gasolio', 'GPL', 'Metano', NOT NULL)
        * `geo_level` (ENUM('nazionale', 'regionale', 'provinciale', 'comune'), NOT NULL)
        * `geo_code` (VARCHAR, es. 'IT', 'LOM', 'MI', 'Roma', NOT NULL) - Codice identificativo dell'area geografica
        * `threshold_type` (ENUM('cheapest_in_area', 'below_price'), NOT NULL)
        * `threshold_value` (DECIMAL(5,3), NULL) - Valore del prezzo se `threshold_type` è 'below_price'
        * `status` (ENUM('active', 'paused', 'deleted'), DEFAULT 'active')
        * `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
        * `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
        * `last_notified_at` (DATETIME, NULL) - Per evitare notifiche troppo frequenti
3. **Implementazione API per Autenticazione Utenti:**
    * Creare endpoint API per la gestione degli utenti (es. in `src/app/api/auth/`):
        * `POST /api/auth/register`: Registrazione nuovo utente.
        * `POST /api/auth/login`: Login utente (generazione token JWT o sessione).
        * `GET /api/auth/logout`: Logout utente.
        * `POST /api/auth/verify-email`: Verifica dell'indirizzo email (se implementata).
        * `POST /api/auth/forgot-password`: Richiesta reset password.
        * `POST /api/auth/reset-password`: Esecuzione reset password.
    * Utilizzare un sistema di autenticazione robusto (es. JWT con `jsonwebtoken` o sessioni).
4. **Implementazione API per Gestione Sottoscrizioni Notifiche:**
    * Creare endpoint API per la gestione delle sottoscrizioni (es. in `src/app/api/subscriptions/`):
        * `POST /api/subscriptions/create`: Crea una nuova sottoscrizione per l'utente autenticato.
        * `GET /api/subscriptions/list`: Restituisce tutte le sottoscrizioni dell'utente autenticato.
        * `PUT /api/subscriptions/:id`: Aggiorna una sottoscrizione esistente.
        * `DELETE /api/subscriptions/:id`: Elimina una sottoscrizione.
    * Assicurarsi che tutte le operazioni siano protette da autenticazione e autorizzazione.

## Fase 2: Backend - Motore di Notifica Prezzi

L'obiettivo di questa fase è sviluppare la logica che controlla i prezzi e invia le notifiche.

1. **Creazione Cron Job per Controllo Prezzi:**
    * Sviluppare un nuovo script cron (es. `src/cron/check-price-alerts.js`) che verrà eseguito periodicamente (es. ogni
      ora o ogni 3 ore).
    * **Logica del cron job:**
        * Recuperare tutte le sottoscrizioni attive dalla tabella `price_subscriptions`.
        * Per ogni sottoscrizione:
            * Determinare il prezzo corrente del `fuel_type` nella `geo_level` e `geo_code` specificati (interrogando la
              tabella `prezzi` o `prezzi_storici`).
            * Se `threshold_type` è 'cheapest_in_area', trovare il prezzo più basso per quel carburante nell'area.
            * Se `threshold_type` è 'below_price', confrontare con `threshold_value`.
            * Se la condizione di notifica è soddisfatta E l'ultima notifica per questa sottoscrizione è stata inviata
              oltre un certo intervallo di tempo (es. 24 ore), allora:
                * Triggerare l'invio della notifica.
                * Aggiornare `last_notified_at` nella tabella `price_subscriptions`.
2. **Sistema di Invio Notifiche Email:**
    * Integrare un servizio di invio email (es. Nodemailer, SendGrid) per inviare le notifiche.
    * Creare un template email chiaro e informativo per le notifiche di prezzo.
    * Includere un link per la disiscrizione facile dalla notifica specifica o da tutte le notifiche.
3. **Definizione Schema Database per Notifiche Inviate (Logging):**
    * Creare una tabella `sent_notifications` per tenere traccia delle notifiche inviate.
    * **Campi proposti:**
        * `id` (Primary Key)
        * `subscription_id` (Foreign Key a `price_subscriptions.id`)
        * `user_id` (Foreign Key a `users.id`)
        * `fuel_type`, `geo_level`, `geo_code` (copia dalla sottoscrizione per storico)
        * `triggered_price` (DECIMAL) - Il prezzo che ha fatto scattare la notifica
        * `sent_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
        * `status` (ENUM('sent', 'failed', 'opened'), DEFAULT 'sent')

## Fase 3: Frontend - Interfaccia Utente per Notifiche

L'obiettivo è fornire agli utenti un'interfaccia intuitiva per gestire le loro notifiche.

1. **Creazione Pagina "Le Mie Notifiche":**
    * Creare una nuova rotta e pagina in Next.js (es. `/notifiche`).
    * Questa pagina sarà accessibile solo agli utenti autenticati.
    * Visualizzerà un elenco delle sottoscrizioni di prezzo attive dell'utente, con opzioni per visualizzare i dettagli,
      modificare o eliminare.
2. **Form di Creazione Nuova Notifica:**
    * Implementare un form sulla pagina `/notifiche` (o come modale/componente riutilizzabile) per permettere agli
      utenti di creare nuove sottoscrizioni.
    * **Campi del form:**
        * Dropdown per `fuel_type` (Benzina, Gasolio, GPL, Metano).
        * Radio button/Dropdown per `geo_level` (Nazionale, Regionale, Provinciale, Comune).
        * Autocomplete o dropdown dinamico per `geo_code` (basato su `geo_level` selezionato).
        * Radio button per `threshold_type` ("Prezzo più basso nell'area" o "Prezzo sotto X €").
        * Input numerico per `threshold_value` (visibile solo se "Prezzo sotto X €" è selezionato).
        * Pulsante "Crea Notifica".
3. **Integrazione con Pagine Esistenti:**
    * Aggiungere un pulsante o un link "Ricevi Notifiche Prezzo" nelle pagine di dettaglio dei distributori o nelle
      pagine dei risultati di ricerca.
    * Questo link dovrebbe, se cliccato, reindirizzare l'utente al form di creazione notifica, pre-compilando i campi
      `fuel_type`, `geo_level` e `geo_code` in base al contesto della pagina.
4. **Messaggi di Feedback UI:**
    * Visualizzare messaggi di successo o errore chiari all'utente dopo la creazione, modifica o eliminazione di una
      sottoscrizione.
    * Utilizzare spinner o stati di caricamento durante le operazioni API.

## Fase 4: Miglioramenti e Robustezza

1. **Gestione Errori e Validazione:**
    * Implementare una validazione robusta lato server e client per tutti gli input delle API e dei form.
    * Gestione degli errori elegante nell'interfaccia utente.
2. **Disiscrizione Facile:**
    * Assicurarsi che ogni email di notifica contenga un link chiaro e funzionante per disiscriversi dalla notifica
      specifica o da tutte le notifiche.
3. **Limiti di Notifica:**
    * Implementare una logica nel motore di notifica per prevenire l'invio eccessivo di email allo stesso utente in un
      breve periodo di tempo.
4. **Scalabilità:**
    * Considerare l'aggiunta di indici appropriati alle tabelle `users`, `price_subscriptions`, `prezzi` e
      `prezzi_storici` per ottimizzare le performance del cron job e delle API.
5. **Sicurezza:**
    * Rivedere le politiche di sicurezza (es. CSP) e la gestione dei dati utente in conformità con il GDPR.

---
