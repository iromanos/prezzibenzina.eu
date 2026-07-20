# Task Breakdown: Proposta 2 - Sezione Statistiche e Andamenti

Questo documento scompone in passaggi concreti l'implementazione della funzionalità "Sezione Statistiche e Andamenti"
per PrezziBenzina.eu.

## Fase 1: Backend e Gestione Dati

L'obiettivo di questa fase è preparare l'infrastruttura per raccogliere, aggregare e servire i dati storici dei prezzi.

1. **Definizione Schema Database:**
    * Creare una nuova tabella nel database (es. `prezzi_storici`) per memorizzare i dati aggregati.
    * **Campi proposti:**
        * `id` (Primary Key)
        * `data` (DATE)
        * `id_carburante` (INTEGER/STRING, Foreign Key alla tabella dei carburanti)
        * `livello_geo` (ENUM: 'nazionale', 'regionale', 'provinciale')
        * `codice_geo` (STRING, es. 'IT', 'LOM', 'MI')
        * `prezzo_medio` (DECIMAL)
        * `prezzo_min` (DECIMAL)
        * `prezzo_max` (DECIMAL)

2. **Creazione Script di Aggregazione:**
    * Sviluppare uno script (es. un comando Next.js o uno script Node.js separato) che esegua le seguenti operazioni:
        * Leggere i prezzi giornalieri dalla fonte dati principale.
        * Calcolare il prezzo medio, minimo e massimo per ogni carburante a livello nazionale, regionale e provinciale.
        * Popolare la tabella `prezzi_storici` con i dati aggregati per il giorno corrente.
    * **Automazione:** Configurare un cron job sul server per eseguire questo script una volta al giorno (es. di notte).
        * Inviare una notifica via email alla conclusione del cron
        * Salvare i log su un file di testo
3. **Sviluppo API Endpoint:**
    * Creare un nuovo endpoint API, ad esempio `/api/statistiche`.
    * L'endpoint deve accettare i seguenti parametri di query:
        * `carburante` (es. 'benzina', 'diesel')
        * `livello_geo` (es. 'nazionale', 'regionale')
        * `codice_geo` (es. 'LOM', 'MI')
        * `startDate` e `endDate` (per definire l'intervallo di tempo)
    * L'API interrogherà la tabella `prezzi_storici` e restituirà i dati in formato JSON, pronti per essere utilizzati
      da una libreria di grafici.

## Fase 2: Frontend e Interfaccia Utente

L'obiettivo è costruire la pagina che permetterà agli utenti di visualizzare e interagire con i dati.

1. **Creazione Nuova Pagina:**
    * Creare una nuova rotta e la relativa pagina in Next.js: `/statistiche`.

2. **Sviluppo Componenti UI:**
    * **Componente Filtri:**
        * Un set di controlli (es. `<select>`) per permettere all'utente di scegliere:
            * Tipo di carburante.
            * Area geografica (con logica dipendente: se si sceglie una regione, il filtro successivo mostra le province
              di quella regione).
            * Intervallo di date (usando un date picker).
    * **Componente Grafico:**
        * Scegliere e integrare una libreria per grafici (es. `Chart.js` con `react-chartjs-2` o `Recharts`).
        * Creare un componente `LineChart` che riceva i dati dall'API e li visualizzi in un grafico a linee. Il grafico
          deve essere responsivo.
    * **Componente Riepilogo (KPI):**
        * Un componente per mostrare dati salienti come: prezzo medio attuale, variazione settimanale/mensile, prezzo
          minimo e massimo nel periodo selezionato.

3. **Assemblaggio Pagina e Data Fetching:**
    * Costruire il layout della pagina `/statistiche` combinando i componenti creati.
    * Implementare la logica di data fetching (preferibilmente con SWR o React Query per gestire il caching e
      l'aggiornamento dinamico) che chiama l'endpoint `/api/statistiche`.
    * Al cambio dei filtri, la richiesta dati deve essere rieseguita e il grafico e i KPI devono aggiornarsi di
      conseguenza.

## Fase 3: SEO e Contenuti

L'obiettivo è assicurarsi che la nuova sezione sia ottimizzata per i motori di ricerca e facile da capire per gli
utenti.

1. **Metadati Dinamici:**
    * Utilizzare `generateMetadata` di Next.js per creare titoli e descrizioni della pagina che riflettano i filtri
      selezionati.
    * **Esempio titolo:** "Andamento Prezzo Benzina in Lombardia - Statistiche Storiche | PrezziBenzina.eu".
    * **Esempio descrizione:** "Scopri l'andamento storico del prezzo della benzina in Lombardia. Grafici e dati
      aggiornati per aiutarti a risparmiare."

2. **Contenuti Descrittivi:**
    * Aggiungere un paragrafo introduttivo nella pagina che spieghi a cosa serve la sezione e come leggere i dati.
    * Aggiungere piccole didascalie o tooltip per aiutare a interpretare il grafico e i KPI.

3. **Struttura URL e Link Interni:**
    * Assicurarsi che l'URL `/statistiche` sia facilmente accessibile dal menu di navigazione principale o dal footer.
    * Valutare se creare URL specifici per le viste pre-filtrate più importanti (es. `/statistiche/benzina/lombardia`)
      se questo porta un vantaggio SEO significativo.

## Fase 4: Test e Rilascio

1. **Test Funzionali:**
    * Verificare che lo script di aggregazione funzioni correttamente.
    * Testare l'API endpoint con vari parametri.
    * Testare l'interattività della pagina frontend (filtri, aggiornamento del grafico).
2. **Test di Performance:**
    * Analizzare il tempo di caricamento della pagina e la velocità di risposta dell'API.
3. **Deployment:**
    * Effettuare il deploy dell'applicazione.
    * Configurare il cron job nell'ambiente di produzione.
    * Monitorare la funzionalità dopo il rilascio.
