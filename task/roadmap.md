# Roadmap del Progetto

## 1. Sistema di valutazione degli impianti con commento

### Obiettivo

Implementare un sistema che permetta agli utenti di valutare e commentare gli impianti di carburante, migliorando
l'engagement e fornendo dati utili ad altri utenti.

### Fasi

#### Fase 1: Definizione dei Requisiti (Settimana 1)

- **Dati da raccogliere:** Voto (es. da 1 a 5 stelle), testo del commento, ID utente, data/ora della valutazione.
- **Regole di moderazione:** Decidere se i commenti necessitano di approvazione, quali contenuti sono vietati.
- **Visualizzazione:** Come mostrare le valutazioni (media, numero di recensioni, elenco commenti).
- **Funzionalità aggiuntive:** Possibilità di modificare/eliminare il proprio commento, segnalazione di commenti
  inappropriati.

#### Fase 2: Progettazione del Database (Settimana 1-2)

- Creazione della tabella `reviews` (o `valutazioni`) con campi:
    - `id` (PRIMARY KEY, AUTO_INCREMENT)
    - `id_impianto` (FOREIGN KEY verso la tabella degli impianti)
    - `user_id` (FOREIGN KEY verso la tabella utenti, se presente)
    - `rating` (INT, es. 1-5)
    - `comment` (TEXT)
    - `created_at` (TIMESTAMP)
    - `updated_at` (TIMESTAMP)
- Aggiornamento della tabella `impianti` per includere `average_rating` e `total_reviews` (o calcolo on-the-fly).

#### Fase 3: Sviluppo API Backend (Settimana 2-3)

- **Endpoint POST `/api/reviews`:** Per inviare una nuova valutazione. Richiede autenticazione.
- **Endpoint GET `/api/impianti/[id]/reviews`:** Per recuperare tutte le valutazioni di un impianto specifico.
- **Endpoint GET `/api/impianti/[id]/average-rating`:** Per recuperare la media delle valutazioni di un impianto.
- **Logica di business:** Validazione dei dati, calcolo della media, gestione degli errori.

#### Fase 4: Sviluppo Frontend (Settimana 3-4)

- **Componente di visualizzazione:** Mostrare le stelle di valutazione, la media e l'elenco dei commenti su ogni pagina
  dell'impianto.
- **Form di inserimento:** Un modulo intuitivo per gli utenti autenticati per lasciare una valutazione e un commento.
- **Integrazione:** Chiamate API dal frontend al backend per inviare e recuperare i dati.
- **Gestione UI/UX:** Feedback visivo all'utente dopo l'invio, gestione degli stati di caricamento/errore.

#### Fase 5: Test e Deployment (Settimana 4-5)

- **Test unitari:** Per le funzioni backend e i componenti frontend.
- **Test di integrazione:** Per verificare il flusso completo (frontend -> backend -> database).
- **Test di carico:** Per assicurarsi che il sistema regga un numero elevato di utenti.
- **Deployment:** Rilascio in ambiente di staging per ulteriori test, poi in produzione.

---
*Nota: Il secondo punto del TODO era vuoto, quindi non è stato incluso nella roadmap.*
