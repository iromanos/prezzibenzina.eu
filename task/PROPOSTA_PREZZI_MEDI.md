# Roadmap: Pagina Prezzi Medi Carburanti per Regione

## Obiettivo

Creare una nuova pagina sul sito `prezzibenzina.eu` che mostri i prezzi medi dei carburanti, aggregati per regione
italiana. L'obiettivo è fornire agli utenti una panoramica chiara dei costi regionali e migliorare l'attrattività del
sito per l'SEO, puntando a raggiungere i primi 10 risultati di ricerca su Google e Bing.

## Dettagli Tecnici e Funzionali

### 1. Sviluppo Backend (API)

*   [x] **Estrazione Dati**:
    * Creare una nuova API endpoint che interroghi la tabella `prezzi_storici` del database.
    * Aggregare i dati per calcolare il prezzo medio per ciascun tipo di carburante (Benzina, Diesel, GPL, Metano) per
      ogni regione.
    * Considerare la possibilità di filtrare per periodo (es. ultimo mese, ultimi 3 mesi, anno corrente) o di default
      mostrare l'ultimo dato disponibile.
*   [x] **Ottimizzazione Query**: Assicurarsi che le query al database siano efficienti per gestire grandi volumi di
    dati e garantire tempi di risposta rapidi.
* **Caching**: Implementare una strategia di caching per l'API per ridurre il carico sul database e migliorare le
  performance.
*   [x] **Sicurezza**: Proteggere l'endpoint API con le opportune misure di sicurezza.

### 2. Sviluppo Frontend (Next.js)

*   [x] **Creazione Pagina**:
    * Realizzare una nuova pagina Next.js (es. `/prezzi-medi-regione`).
    * La pagina dovrà essere server-side rendered (SSR) o static-site generated (SSG) per massimizzare i benefici SEO.
*   [x] **Interfaccia Utente (UI)**:
    * Visualizzazione chiara dei prezzi medi per regione. Si potrebbe optare per:
        * Una tabella riassuntiva.
        * Una mappa interattiva dell'Italia con le regioni colorate in base al prezzo medio.
        * Grafici a barre o a linee per confrontare le regioni.
    * Filtri per tipo di carburante e, se implementato nel backend, per periodo.
    * Design responsive per una fruizione ottimale su desktop e mobile.

### 3. Ottimizzazione SEO

*   [x] **Meta Tag**:
    * Definire `title` e `description` unici e pertinenti per la pagina, includendo parole chiave come "prezzi medi
      carburante", "prezzi benzina regione", "costo diesel Italia".
    * Utilizzare `next/head` per la gestione dei meta tag.
*   [x] **URL Semantico**: Assicurarsi che l'URL della pagina sia pulito e descrittivo (es.
    `/prezzi-medi-carburante-regione`).
*   [x] **Schema Markup**: Implementare lo schema markup (es. `Product` o `AggregateOffer` se applicabile) per i dati
    dei prezzi per migliorare la visibilità nei risultati di ricerca.
*   [x] **Contenuto Testuale**: Aggiungere del testo descrittivo sulla pagina che spieghi i dati presentati,
    l'importanza del confronto prezzi e includa parole chiave rilevanti.
*   [x] **Sitemap**: Aggiornare la sitemap del sito per includere la nuova pagina. **(Eseguito)**
*   [x] **Link Interni**: Creare link interni da altre pagine rilevanti del sito alla nuova pagina dei prezzi medi.

### 4. Performance

* **Ottimizzazione Immagini**: Se vengono utilizzate immagini (es. per la mappa), assicurarsi che siano ottimizzate.
* **Code Splitting**: Utilizzare il code splitting di Next.js per caricare solo il codice necessario per la pagina.
* **Lazy Loading**: Implementare il lazy loading per componenti non critici o dati iniziali.

### 5. Testing

* **Unit Test**: Testare i componenti React e le funzioni di utilità.
* **Integration Test**: Testare l'integrazione tra frontend e backend.
* **End-to-End Test**: Utilizzare strumenti come Cypress o Playwright per testare il flusso utente completo.
* **Test SEO**: Verificare l'indicizzazione e la visibilità della pagina tramite strumenti come Google Search Console.

### 6. Deployment

* Integrare la nuova pagina nel processo di CI/CD esistente.
* Monitorare le performance e l'indicizzazione post-deployment.

### 7. Integrazione Link Interni

Per massimizzare la visibilità e il traffico verso la nuova pagina "Prezzi medi dei carburanti per regione", si propone
di inserire link pertinenti nelle seguenti aree del sito:

*   [x] **Header di Navigazione**: Già implementato nel componente `Header.jsx` (desktop e mobile).
*   [x] **Pagina Home (`/`)**: Considerare l'aggiunta di un link in una sezione dedicata a "Statistiche" o "Dati
    principali". **(Eseguito)**
*   [x] **Pagina "Statistiche" (`/statistiche`)**: Posizione ideale per un link contestuale, se la pagina esiste. **(
    Eseguito)**
*   [x] **Footer del Sito**: Un link nella sezione "Dati e Informazioni" o "Statistiche" del footer per una visibilità
    su tutte le pagine. **(Eseguito)**

---

## Task 9: Implementazione Grafici Interattivi per Prezzi Medi Regionali

### Obiettivo

Arricchire la pagina `/prezzi-medi-regione` con visualizzazioni grafiche interattive per migliorare l'analisi dei dati,
l'engagement utente e fornire una comprensione più immediata delle tendenze dei prezzi.

### Grafici Proposti

1.  [x] **Grafico a Barre: Confronto Prezzo Medio per Carburante tra Regioni**
    * **Descrizione**: Mostra il prezzo medio di un *singolo tipo di carburante* (selezionabile dall'utente) in tutte le
      regioni, permettendo un confronto visivo immediato tra le diverse aree geografiche.
    * **Interattività**: Selettore per il tipo di carburante (Benzina, Diesel, GPL, Metano).

### Dettagli Tecnici e Funzionali

#### Backend (API/Repository)

* **Modifica `getPrezziMediRegioneAggregati`**: La funzione attuale fornisce l'ultimo prezzo per regione e carburante,
  che è un buon punto di partenza per i grafici a barre.
* **Nuove Funzioni Repository (se necessario)**:
    * Per il grafico a linee, sarà necessaria una nuova funzione che recuperi i dati storici per un dato carburante e
      regione, potenzialmente con un filtro per intervallo di date.
    * Potrebbe essere utile una funzione per recuperare un elenco dinamico di tutti i tipi di carburante disponibili.
* **Ottimizzazione Dati per Grafici**: Assicurarsi che i dati restituiti siano nel formato più efficiente per la
  libreria grafica scelta (es. array di oggetti con `dataKey` per Recharts).

#### Frontend (Next.js)

* **Libreria Grafica**: Si propone l'utilizzo di **Recharts** per coerenza con altri componenti del sito (es.
  `StatisticheChart`).
* **Componenti Client-Side**: I grafici interattivi richiederanno componenti React client-side (`'use client'`) per
  gestire lo stato e l'interattività.
* **Creazione Componenti Grafici**:
    * Sviluppare componenti React specifici per ciascun tipo di grafico proposto (es. `RegionFuelBarChart`,
      `FuelTypeBarChart`, `HistoricalLineChart`).
    * Implementare la logica per passare i dati e le opzioni di configurazione ai grafici.
* **Interattività UI**:
    * Aggiungere selettori (dropdown, radio button) per permettere agli utenti di scegliere il tipo di carburante, la
      regione o l'intervallo di tempo.
    * Implementare la logica per aggiornare i dati dei grafici in base alle selezioni dell'utente.
* **Integrazione nella Pagina**: Inserire i nuovi componenti grafici nella pagina `/prezzi-medi-regione`, probabilmente
  in una sezione dedicata sotto la tabella esistente, o con un meccanismo a schede/toggle per passare dalla tabella ai
  grafici.
* **Gestione Stato**: Utilizzare `useState` e `useEffect` per gestire lo stato dei filtri e i dati caricati
  dinamicamente per i grafici.

#### UI/UX

* **Design Intuitivo**: Assicurare che i controlli per i grafici siano facili da usare e ben integrati con il design
  Bootstrap esistente.
* **Legende e Tooltip**: Fornire legende chiare e tooltip informativi sui grafici per migliorare la comprensione dei
  dati.
* **Accessibilità**: Considerare l'accessibilità dei grafici per tutti gli utenti.

#### SEO/Performance

* **Server-Side Rendering (SSR)**: Mantenere la tabella principale renderizzata lato server per garantire i benefici
  SEO. I grafici interattivi saranno caricati dinamicamente lato client.
* **Ottimizzazione Caricamento Dati**: Implementare strategie di caching e lazy loading per i dati dei grafici per
  minimizzare i tempi di caricamento e migliorare le performance percepite.

### Stima Tempi (Indicativa)

* **Backend (modifiche API/Repo per dati grafici)**: 2-4 giorni lavorativi
* **Frontend (implementazione grafici con Recharts)**: 4-7 giorni lavorativi
* **UI/UX e Testing**: 2-3 giorni lavorativi
* **Totale stimato**: 8-14 giorni lavorativi.

### Risorse Necessarie

* Accesso al database `prezzi_storici`.
* Ambiente di sviluppo Next.js.
* Libreria grafica Recharts.

---