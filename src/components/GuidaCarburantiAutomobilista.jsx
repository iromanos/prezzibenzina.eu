import React from 'react';
import Display6977770298 from "./ads/Display-6977770298";

const GuidaCarburantiAutomobilistaVER3OLD = ({riepilogo, distributori, titoloPagina}) => {

    const generaDatiEGuida = (datiRiepilogo, listaDistributori) => {
        if (!datiRiepilogo || !listaDistributori || listaDistributori.length === 0) {
            return null;
        }

        const infoRichiesta = datiRiepilogo.request || {};
        const tipoCarburante = (infoRichiesta.carburante || "Benzina").toLowerCase();

        // Helper per capitalizzare correttamente la regione (es. "lombardia" -> "Lombardia", "emilia-romagna" -> "Emilia-Romagna")
        const formattaRegione = (reg) => {
            if (!reg) return "";
            return reg.split(/([\s-]+)/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
        };

        // =================================================================
        // DETERMINAZIONE DINAMICA DELLA LOCALITÀ (Gerarchia: Comune -> Provincia -> Regione)
        // =================================================================
        let localita = "nella tua zona";
        if (infoRichiesta.comune && infoRichiesta.comune.description) {
            localita = `a ${infoRichiesta.comune.description}`;
        } else if (infoRichiesta.provincia_descrizione || infoRichiesta.provincia) {
            const nomeProvincia = infoRichiesta.provincia_descrizione || infoRichiesta.provincia.toUpperCase();
            localita = `in provincia di ${nomeProvincia}`;
        } else if (infoRichiesta.regione) {
            localita = `in ${formattaRegione(infoRichiesta.regione)}`;
        }

        const infoCarburante = datiRiepilogo.carburanti?.[Object.keys(datiRiepilogo.carburanti || {})[0]] || {};
        const mediaPrezzo = infoCarburante.media || "N/D";
        const minPrezzo = infoCarburante.min || "N/D";
        const maxPrezzo = infoCarburante.max || "N/D";

        const dataAgg = datiRiepilogo.dataAggiornamento
            ? new Date(datiRiepilogo.dataAggiornamento).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            : "oggi";

        const prezziImpianti = listaDistributori.map(d => d.properties.prezzoMinimo);
        const minLocale = Math.min(...prezziImpianti);
        const maxLocale = Math.max(...prezziImpianti);
        const deltaPrezzoLocale = (mediaPrezzo - minLocale).toFixed(3);
        const risparmioPieno = (deltaPrezzoLocale * 50).toFixed(2);
        const massimoRisparmio = ((maxPrezzo - minLocale) * 50).toFixed(2);

        const marchi = datiRiepilogo.marchi || [];
        const totaleImpianti = datiRiepilogo.totaleImpianti || listaDistributori.length;

        const haPompeBianche = marchi.some(m =>
            m.marchio?.toLowerCase().includes("no logo") ||
            m.marchio?.toLowerCase().includes("bianca") ||
            m.marchio?.toLowerCase().includes("indipendente")
        ) || listaDistributori.some(d => d.properties.bandiera?.toLowerCase().includes("no logo"));

        const dettagliMarchi = marchi
            .filter(m => m.marchio !== "Tutti")
            .map(m => `<strong>${m.marchio}</strong> (con ${m.impianti} distributori)`)
            .join(", ");

        // =================================================================
        // ALGORITMO DI HASH DJB2 (Garantisce l'univocità del testo)
        // =================================================================

        const idComune = infoRichiesta.comune?.id || "";
        const stringaUnivoca = `${localita}-${totaleImpianti}-${tipoCarburante}-${idComune}-${mediaPrezzo}`;

        let hash = 5381;
        for (let i = 0; i < stringaUnivoca.length; i++) {
            hash = ((hash << 5) + hash) + stringaUnivoca.charCodeAt(i);
        }
        const localitaHash = Math.abs(hash);

        // Generatore di accoppiamenti pseudo-casuali deterministici tramite numeri primi (Salt)
        const pick = (arr, salt = 0) => arr[(localitaHash + salt) % arr.length];

        // Matrice di micro-sinonimi cross-combinatori
        const sAutomobilista = pick(["guidatore", "conducente", "utente della strada", "automobilista della zona"], 17);
        const sContesto = pick(["contesto territoriale", "quadro locale", "tessuto urbano", "perimetro geografico"], 31);
        const sSpesa = pick(["esborso mensile", "bilancio familiare", "costo di gestione", "portafoglio"], 61);
        const sFluttuazioni = pick(["oscillazioni repentine", "variazioni di mercato", "dinamiche di prezzo"], 73);

        // --- SEZIONE 1: 4 Varianti di Apertura in formato JSX (Rimodulate per fluire con le preposizioni) ---
        let bloccoSezione1;
        switch ((localitaHash + 101) % 4) {
            case 0:
                bloccoSezione1 = (
                    <>
                        <p className="mb-3">
                            Guidare quotidianamente <strong>{localita}</strong> mette ogni {sAutomobilista} di fronte a
                            una realtà economica in costante mutamento, dove la gestione dei costi di rifornimento
                            diventa un fattore cruciale per il {sSpesa}.
                        </p>
                        <p className="mb-3">
                            Muoversi tra le strade di questa zona, prestando attenzione alle fluttuazioni
                            di <strong>{tipoCarburante}</strong>, comporta un monitoraggio visivo quasi automatico dei
                            cartelli prezzo esposti lungo le carreggiate.
                        </p>
                        <p className="mb-0">
                            Chi si mette al volante può contare su una rete di distribuzione eccezionalmente sviluppata,
                            che vede la presenza complessiva di ben <strong>{totaleImpianti} stazioni di
                            servizio</strong>. Questa capillarità garantisce un punto di rifornimento sempre a portata
                            di mano, ma al contempo genera una frammentazione tariffaria che merita di essere analizzata
                            con attenzione.
                        </p>
                    </>
                );
                break;
            case 1:
                bloccoSezione1 = (
                    <>
                        <p className="mb-3">
                            Per chi si sposta abitualmente <strong>{localita}</strong>, l'andamento dei costi legati
                            a <strong>{tipoCarburante}</strong> rappresenta una delle voci più monitorate nel {sSpesa}.
                        </p>
                        <p className="mb-3">
                            La necessità di individuare soluzioni vantaggiose per la propria vettura spinge i conducenti
                            a confrontare costantemente i listini esposti, specie quando i flussi di traffico
                            giornalieri costringono a frequenti tappe di rifornimento.
                        </p>
                        <p className="mb-0">
                            Il {sContesto} offre una risposta strutturata a questa domanda, grazie a un network
                            complessivo di ben <strong>{totaleImpianti} impianti di erogazione</strong>. Una densità
                            commerciale così marcata moltiplica le opzioni di scelta, accentuando però quei divari
                            economici che rendono indispensabile un esame mirato dei prezzi.
                        </p>
                    </>
                );
                break;
            case 2:
                bloccoSezione1 = (
                    <>
                        <p className="mb-3">
                            La mappa dei rifornimenti stradali <strong>{localita}</strong> riflette fedelmente
                            le {sFluttuazioni} dei mercati energetici globali e locali.
                        </p>
                        <p className="mb-3">
                            In quest'area geografica, ottimizzare la spesa per il rifornimento
                            di <strong>{tipoCarburante}</strong> non è solo un'opportunità, ma una necessità legata alla
                            gestione del {sSpesa}. Attualmente la zona è servita da un circuito capillare composto
                            da <strong>{totaleImpianti} stazioni di rifornimento</strong>.
                        </p>
                        <p className="mb-0">
                            Questa forte concorrenza teorica si traduce sul campo in un ventaglio di offerte commerciali
                            fortemente disomogeneo, che permette ai guidatori più attenti di intercettare margini di
                            risparmio significativi senza stravolgere i propri percorsi di viaggio.
                        </p>
                    </>
                );
                break;
            default:
                bloccoSezione1 = (
                    <>
                        <p className="mb-3">
                            I flussi di traffico che si sviluppano giornalmente <strong>{localita}</strong> si scontrano
                            costantemente con il problema del caro-carburante, focalizzando l'attenzione sulle tariffe
                            di <strong>{tipoCarburante}</strong>.
                        </p>
                        <p className="mb-3">
                            Esaminando da vicino la situazione a livello locale, emerge chiaramente come la vicinanza
                            geografica tra i vari distributori non sia sinonimo di listini identici. Con
                            ben <strong>{totaleImpianti} punti vendita attivi</strong> dislocati sul territorio, la rete
                            offre risposte commerciali molto distanti tra loro.
                        </p>
                        <p className="mb-0">
                            Per ogni {sAutomobilista} diventa quindi prioritario decodificare questa frammentazione per
                            evitare di pagare tariffe fuori mercato e alleggerire l'impatto economico complessivo sul
                            lungo periodo.
                        </p>
                    </>
                );
        }

        // --- SEZIONE 2: 4 Varianti sulla Forbice dei Prezzi in formato JSX ---
        let bloccoSezione2;
        switch ((localitaHash + 131) % 4) {
            case 0:
                bloccoSezione2 = (
                    <>
                        <p className="mb-3">
                            L'elemento che salta subito all'occhio analizzando le cifre macroeconomiche locali è
                            l'estensione della forbice dei <strong>prezzi</strong>, un indicatore chiaro di quanto il
                            mercato libero possa oscillare all'interno del medesimo perimetro.
                        </p>
                        <p className="mb-3">
                            Se consideriamo che il prezzo medio calcolato per l'intera area si attesta
                            a <strong>{mediaPrezzo} euro al litro</strong>, questa cifra rappresenta solo un punto di
                            equilibrio virtuale. La realtà vissuta dai consumatori sul campo è delimitata da due estremi
                            estremamente distanti.
                        </p>
                        <p className="mb-0">
                            La soglia minima viene infatti intercettata a <strong>{minPrezzo} euro al litro</strong>,
                            mentre i picchi arrivano a toccare la quota considerevole di <strong>{maxPrezzo} euro al
                            litro</strong>. Un divario teorico così netto dimostra come il posizionamento commerciale
                            delle stazioni possa variare drasticamente.
                        </p>
                    </>
                );
                break;
            case 1:
                bloccoSezione2 = (
                    <>
                        <p className="mb-3">
                            Il dato numerico più interessante che emerge analizzando il {sContesto} riguarda l'ampiezza
                            dello scarto tra le tariffe minime e massime, un chiaro segnale di competitività
                            asimmetrica. I <strong>prezzi</strong> applicati alla pompa mostrano oscillazioni repentine
                            anche a breve distanza.
                        </p>
                        <p className="mb-3">
                            A fronte di un valore medio registrato nella zona pari a <strong>{mediaPrezzo} euro al
                            litro</strong>, le reali opportunità si nascondono nei dettagli delle singole stazioni.
                        </p>
                        <p className="mb-0">
                            La tariffa d'ingresso più competitiva si posiziona infatti a quota <strong>{minPrezzo} euro
                            al litro</strong>, lasciando a grande distanza i picchi massimi rilevati, che si spingono
                            fino a <strong>{maxPrezzo} euro al litro</strong> nelle tratte ad alto scorrimento stradale.
                        </p>
                    </>
                );
                break;
            case 2:
                bloccoSezione2 = (
                    <>
                        <p className="mb-3">
                            Prendendo in esame le statistics correnti della zona, notiamo che lo scarto tra i prezzi
                            minimi e massimi è l'ago della bilancia per il risparmio. Il valore medio teorico rilevato è
                            di <strong>{mediaPrezzo} euro al litro</strong>, ma è un dato che nasconde una forte
                            polarizzazione commerciale.
                        </p>
                        <p className="mb-3">
                            Da un lato abbiamo stazioni d'eccellenza che bloccano il prezzo a <strong>{minPrezzo} euro
                            al litro</strong>, dall'altro impianti meno economici che sfiorano picchi
                            di <strong>{maxPrezzo} euro al litro</strong>.
                        </p>
                        <p className="mb-0">
                            Questa asimmetria mette in luce l'importance di non fermarsi al primo distributore sul
                            percorso, poiché la pianificazione della sosta incide direttamente sul {sSpesa} complessivo
                            delle famiglie.
                        </p>
                    </>
                );
                break;
            default:
                bloccoSezione2 = (
                    <>
                        <p className="mb-3">
                            Analizzare la forbice dei costi locali è il primo passo per comprendere le dinamiche
                            dei <strong>prezzi</strong> in questa porzione di territorio. La media matematica si attesta
                            attualmente a <strong>{mediaPrezzo} euro al litro</strong>, ma la vera operatività
                            commerciale si gioca su estremi opposti.
                        </p>
                        <p className="mb-3">
                            La base di partenza orientata al risparmio si attesta a <strong>{minPrezzo} euro al
                            litro</strong>, mentre i rifornimenti effettuati nelle stazioni meno competitive possono
                            arrivare a costare fino a <strong>{maxPrezzo} euro al litro</strong>.
                        </p>
                        <p className="mb-0">
                            Si tratta di differenze centesimali che, moltiplicate per la capacità di un serbatoio medio,
                            ridefiniscono completamente i concetti di convenienza e posizionamento della zona.
                        </p>
                    </>
                );
        }

        // --- SEZIONE 4: 3 Varianti sulla Modalità di Erogazione in formato JSX ---
        let bloccoSezione4;
        switch ((localitaHash + 151) % 3) {
            case 0:
                bloccoSezione4 = (
                    <p className="mb-3">
                        Un altro fattore strutturale che influisce pesantemente sul prezzo finale esposto è la modalità
                        di erogazione scelta dall'utente al momento della sosta. La transizione della rete distributiva
                        verso l'automazione ha ridefinito le abitudini di consumo, spingendo la maggior parte degli
                        impianti della zona a potenziare l'offerta legata al <strong>"Fai da te"</strong>. Molti dei
                        punti vendita analizzati offrono ormai una doppia opzione, consentendo di accedere alla tariffa
                        minima solo se si accetta di utilizzare in autonomia la colonnina di pagamento automatico.
                    </p>
                );
                break;
            case 1:
                bloccoSezione4 = (
                    <p className="mb-3">
                        Sul costo finale del rifornimento incide in maniera determinante anche la componente logistica
                        legata al servizio di piazzale. La progressiva diffusione delle corsie automatizzate ha
                        modificato profondamente le preferenze degli utenti, orientati sempre più verso formule
                        di <strong>"Self-Service"</strong> per catturare i prezzi più vantaggiosi. L'accesso ai listini
                        minimi della zona è quasi ovunque subordinato all'utilizzo autonomo della colonnina di
                        erogazione, lasciando le corsie servite a tariffe nettamente superiori.
                    </p>
                );
                break;
            default:
                bloccoSezione4 = (
                    <p className="mb-3">
                        Non si può sottovalutare l'impatto della scelta tra corsia 'Fai da te' e corsia 'Servito' sulla
                        spesa finale alla pompa. Il mercato locale spinge con forza verso l'automazione dei piazzali: i
                        gestori tendono ad abbassare i margini di guadagno esclusivamente sulle
                        colonnine <strong>Self-Service</strong> per attirare i flussi di clienti. Scegliere la comodità
                        dell'assistenza del personale significa quasi sempre allinearsi istantaneamente sulla fascia di
                        prezzo più alta della forbice locale.
                    </p>
                );
        }

        let insightRisparmio = "";
        if (parseFloat(risparmioPieno) > 6.00) {
            insightRisparmio = `Dato l'elevato livello di frammentazione dei prezzi in questa area geografica, la convenienza locale è eccezionalmente alta. Lo scostamento tra i gestori è così marcato da giustificare una deviazione dal proprio percorso abituale pur di raggiungere le pompe più economiche.`;
        } else {
            insightRisparmio = `La concorrenza locale mantiene i prezzi abbastanza compatti e vicini alla media territoriale. Nonostante ciò, l'accumulo di piccoli risparmi su base mensile garantisce comunque un ritorno economico da non sottovalutare per chi usa il veicolo ogni giorno.`;
        }

        return {
            localita, tipoCarburante, mediaPrezzo, minPrezzo, maxPrezzo, dataAgg,
            minLocale, maxLocale, deltaPrezzoLocale, risparmioPieno, massimoRisparmio, dettagliMarchi, haPompeBianche,
            totaleImpianti, bloccoSezione1, bloccoSezione2, bloccoSezione4, insightRisparmio
        };
    };

    const dati = generaDatiEGuida(riepilogo, distributori);

    if (!dati) {
        return (
            <div className="alert alert-danger my-4" role="alert">
                Ops! Al momento non abbiamo abbastanza dati per mostrarti la guida ai prezzi. Riprova più tardi!
            </div>
        );
    }

    return (
        <div className="py-2">

            <h2 className={'h4'}>{titoloPagina}</h2>
            <p className="text-muted small mb-4">
                Analisi indipendente e consigli pratici basati sui dati ufficiali del <strong>{dati.dataAgg}</strong> e
                monitorati in tempo reale secondo le ultime rilevazioni disponibili.
            </p>

            {/* Tabella riassuntiva dei costi */}
            <section className="mb-4">
                <h2 className="h5 text-primary mb-3 fw-normal">📊 Quadro generale dei prezzi {dati.localita}</h2>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle ">
                        <thead className="table-light text-uppercase">
                        <tr>
                            <th scope="col"><span className={'fw-normal small'}>Prezzo alla pompa</span></th>
                            <th scope="col"><span className={'fw-normal small'}>Impatto sul Pieno (50L)</span></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><strong className="text-success">{dati.minPrezzo} €</strong></td>
                            <td className="text-muted">Il massimo risparmio possibile oggi</td>
                        </tr>
                        <tr>
                            <td><strong>{dati.mediaPrezzo} €</strong></td>
                            <td className="text-muted">La tariffa media di riferimento della zona</td>
                        </tr>
                        <tr>
                            <td><strong className="text-danger">{dati.maxPrezzo} €</strong></td>
                            <td className="text-muted">Da evitare se vuoi ottimizzare la spesa</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Blocco Evidenziato Callout */}
            <div className="alert alert-info border-start border-info border-4 p-4 mb-4" role="alert">
                <h3 className="h6 fw-bold mb-2">💡 Il calcolo in tasca:</h3>
                <p className="">
                    Scegliendo con attenzione l'impianto più conveniente rispetto alla media,
                    risparmi ben <strong>{dati.deltaPrezzoLocale} € per ogni singolo litro</strong>.
                    Significa che su un pieno da 50 litri ti restano in tasca ben <strong
                    className="text-dark">{dati.risparmioPieno} € netti</strong> in un colpo solo!
                </p>
                <p className=" small">{dati.insightRisparmio}</p>
                <p className="mb-0">Facendo il confronto con il massimo prezzo rilevato, il risparmio sale a <strong
                    className='fs-2'>{dati.massimoRisparmio} €</strong>.</p>
            </div>

            <Display6977770298 className={'mb-4'}/>

            {/* Corpo del Report strutturato */}
            <main className="">

                <section className="mb-4">
                    <h2 className="h5 text-uppercase">1. La mappa dei carburanti {dati.localita}</h2>
                    <div className="lh-base ">{dati.bloccoSezione1}</div>
                </section>

                <Display6977770298/>

                <hr className="my-4 text-muted"/>
                <section className="mb-4">
                    <h2 className="h5 text-uppercase">2. Capire la forbice dei prezzi per non sbagliare</h2>
                    <div className="lh-base ">{dati.bloccoSezione2}</div>
                    <p className="mt-3">
                        Se proiettiamo questo scostamento sul lungo periodo, la scelta strategica del posto giusto in
                        cui fermarsi
                        si traduce immediatamente in un vantaggio economico strutturato, capace di alleggerire
                        sensibilmente l'impatto dei rifornimenti ricorrenti.
                    </p>
                </section>

                <Display6977770298/>
                <hr className="my-4 text-muted"/>

                <section className="mb-4">
                    <h2 className="h5 text-uppercase">3. Analisi della concorrenza e dei marchi presenti</h2>
                    <p className="mb-3">
                        La spiegazione di questa marcata asimmetria tariffaria risiede principalmente nella struttura
                        della concorrenza e nella varietà dei marchi commerciali che si spartiscono il
                        territorio, dove i diversi <strong>distributori</strong> cercano di adattarsi e posizionarsi
                        strategicamente lungo i flussi di traffico principali.
                    </p>
                    <p>
                        La mappa dei loghi petroliferi vede la coesistenza di operatori tradizionali ben insediati, tra
                        cui spiccano insegne note come <span
                        dangerouslySetInnerHTML={{__html: dati.dettagliMarchi}}/>.
                    </p>
                    {dati.haPompeBianche ? (
                        <p className="mb-0">
                            Accanto a questi colossi storici della vendita al dettaglio, gioca un ruolo fondamentale la
                            presenza delle cosiddette <strong>"Pompe Bianche"</strong>, ovvero stazioni di servizio
                            indipendenti e prive di un brand multinazionale da finanziare. Le pompe no-logo, sfruttando
                            costi di gestione più snelli e l'assenza di pesanti investimenti pubblicitari, riescono a
                            posizionarsi sul mercato con le tariffe in assoluto più <strong>convenienti</strong> della
                            zona. Questo fenomeno genera
                            una forte spinta competitiva, poiché la loro vicinanza costringe i marchi tradizionali
                            circostanti a rivedere i propri listini al ribasso per non perdere clienti.
                        </p>
                    ) : (
                        <>
                            <p className="">
                                In questo specifico contesto territoriale, la competizione si gioca interamente sul
                                posizionamento strategico dei <strong>grandi marchi storici</strong> per risultare i
                                più <strong>convenienti</strong> possibili alle auto di passaggio.
                                Non essendoci una forte incidenza di distributori indipendenti o no-logo nel campione
                                analizzato, sono le stesse compagnie principali a sfidarsi a colpi di centesimi sul filo
                                del rasoio.
                            </p>
                            <p>
                                Questa dinamica spinge i singoli gestori delle stazioni di punta a differenziare
                                pesantemente i prezzi tra loro,
                                basandosi sul volume di traffico della via o sulla vicinanza ad altre insegne rivali per
                                accaparrarsi le quote di mercato locali.
                            </p>
                        </>
                    )}
                </section>

                <Display6977770298/>
                <hr className="my-4 text-muted"/>

                <section className="mb-4">
                    <h2 className="h5 text-uppercase">4. L'importance della modalità: Self-Service vs Servito</h2>
                    <div className="lh-base ">{dati.bloccoSezione4}</div>
                    {/*<p className="mb-0 mt-2">*/}
                    {/*    Il servizio assistito sul piazzale, pur mantenendo una sua utilità per fasce di utenza*/}
                    {/*    specifiche o per chi cerca comfort, sconta inevitabilmente il costo del lavoro del personale e*/}
                    {/*    tende ad allinearsi sui valori massimi della forbice tariffaria. Sapere in anticipo se un*/}
                    {/*    impianto è strutturato come un sistema completamente automatizzato o se offre un presidio misto*/}
                    {/*    permette al guidatore di approcciare l'area di rifornimento con una chiara consapevolezza della*/}
                    {/*    spesa a cui va incontro.*/}
                    {/*</p>*/}
                </section>

                <Display6977770298/>

                {/* Card Strategie */}
                <section className="card bg-white p-4 my-4">
                    <h2 className="h6 text-uppercase">🎯 Strategie Avanzate di Risparmio</h2>
                    <p className="text-muted small mb-3">Metti in pratica questi tre pilastri fondamentali ogni volta
                        che sei alla guida:</p>

                    <div className="mb-3">
                        <h3 className="h6 fw-bold text-primary mb-1">A. Pianifica le soste strategiche</h3>
                        <p className="mb-0 small ">
                            I <strong>distributori</strong> più convenienti tendono a concentrarsi lungo le arterie ad
                            alto flusso
                            commerciale o nei pressi di snodi logistici. Evita di fare rifornimento in autostrada o in
                            vie residenziali isolate se vuoi risparmiare.
                        </p>
                    </div>

                    <div className="mb-3">
                        <h3 className="h6 fw-bold text-primary mb-1">B. Sfrutta l'effetto specchio</h3>
                        <p className="mb-0 small ">
                            Quando vedi due o tre stazioni vicine sullo stesso asse stradale, la guerra dei centesimi
                            tra i gestori è spietata per accaparrarsi i clienti di passaggio. Approfittane sempre
                            svoltando sul lato più conveniente.
                        </p>
                    </div>

                    <div>
                        <h3 className="h6 fw-bold text-primary mb-1">C. Non ridurti mai alla riserva</h3>
                        <p className="mb-0 small ">
                            Viaggiare con la spia accesa ti costringe a fermarti al primo distributore disponibile che
                            incontri sul tragitto, togliendoti il potere di scegliere la tariffa migliore e
                            obbligandoti, purtroppo, a pagare i prezzi massimi.
                        </p>
                    </div>
                </section>

            </main>

            <footer className="mt-5 pt-3 border-top border-light text-center text-muted small">
                Le informazioni macro-territoriali fornite si basano sulle elaborazioni dei dati ufficiali messi a
                disposizione dai gestori della zona. Buon viaggio e guida con prudenza!
            </footer>
        </div>
    );
};

const GuidaCarburantiAutomobilistaVER3 = ({riepilogo, distributori, titoloPagina}) => {

    const generaDatiEGuida = (datiRiepilogo, listaDistributori) => {
        if (!datiRiepilogo || !listaDistributori || listaDistributori.length === 0) {
            return null;
        }

        const infoRichiesta = datiRiepilogo.request || {};
        const tipoCarburante = (infoRichiesta.carburante || "Benzina").toLowerCase();

        // Helper per capitalizzare correttamente la regione (es. "lombardia" -> "Lombardia", "emilia-romagna" -> "Emilia-Romagna")
        const formattaRegione = (reg) => {
            if (!reg) return "";
            return reg.split(/([\s-]+)/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
        };

        // =================================================================
        // DETERMINAZIONE DINAMICA DELLA LOCALITÀ (Gerarchia: Comune -> Provincia -> Regione)
        // =================================================================
        let localita = "nella tua zona";
        if (infoRichiesta.comune && infoRichiesta.comune.description) {
            localita = `a ${infoRichiesta.comune.description}`;
        } else if (infoRichiesta.provincia_descrizione || infoRichiesta.provincia) {
            const nomeProvincia = infoRichiesta.provincia_descrizione || infoRichiesta.provincia.toUpperCase();
            localita = `in provincia di ${nomeProvincia}`;
        } else if (infoRichiesta.regione) {
            localita = `in ${formattaRegione(infoRichiesta.regione)}`;
        }

        const infoCarburante = datiRiepilogo.carburanti?.[Object.keys(datiRiepilogo.carburanti || {})[0]] || {};
        const mediaPrezzo = infoCarburante.media || "N/D";
        const minPrezzo = infoCarburante.min || "N/D";
        const maxPrezzo = infoCarburante.max || "N/D";

        const dataAgg = datiRiepilogo.dataAggiornamento
            ? new Date(datiRiepilogo.dataAggiornamento).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            : "oggi";

        const prezziImpianti = listaDistributori.map(d => d.properties.prezzoMinimo);
        const minLocale = Math.min(...prezziImpianti);
        const maxLocale = Math.max(...prezziImpianti);
        const deltaPrezzoLocale = (mediaPrezzo - minLocale).toFixed(3);
        const risparmioPieno = (deltaPrezzoLocale * 50).toFixed(2);
        const massimoRisparmio = ((maxPrezzo - minLocale) * 50).toFixed(2);

        // =================================================================
        // ESTRAZIONE SICURA DEL MARCHIO SINGOLO ALLA RADICE (SE PRESENTE)
        // =================================================================
        let marchioFiltroSingolo = null;
        if (datiRiepilogo.marchio) {
            if (typeof datiRiepilogo.marchio === 'object') {
                marchioFiltroSingolo = datiRiepilogo.marchio.nome || datiRiepilogo.marchio.id || null;
            } else {
                marchioFiltroSingolo = String(datiRiepilogo.marchio);
            }
        }

        // =================================================================
        // GESTIONE E NORMALIZZAZIONE DELL'ARRAY MARCHI
        // =================================================================
        const marchiGrezzi = datiRiepilogo.marchi || [];
        const marchi = marchiGrezzi.map(m => {
            let nomeMarchio = "";
            if (m.marchio) {
                if (typeof m.marchio === 'object') {
                    nomeMarchio = m.marchio.nome || m.marchio.id || "";
                } else {
                    nomeMarchio = String(m.marchio);
                }
            }
            return {
                ...m,
                marchioFormattato: nomeMarchio
            };
        });

        const totaleImpianti = datiRiepilogo.totaleImpianti || listaDistributori.length;

        const haPompeBianche = marchi.some(m =>
            m.marchioFormattato.toLowerCase().includes("no logo") ||
            m.marchioFormattato.toLowerCase().includes("bianca") ||
            m.marchioFormattato.toLowerCase().includes("indipendente")
        ) || listaDistributori.some(d => d.properties.bandiera?.toLowerCase().includes("no logo"));

        const dettagliMarchi = marchi
            .filter(m => m.marchioFormattato !== "Tutti" && m.marchioFormattato !== "")
            .map(m => `<strong>${m.marchioFormattato}</strong> (con ${m.impianti} distributori)`)
            .join(", ");

        // =================================================================
        // ALGORITMO DI HASH DJB2 (Garantisce l'univocità del testo)
        // =================================================================
        const idComune = infoRichiesta.comune?.id || "";
        const stringaUnivoca = `${localita}-${totaleImpianti}-${tipoCarburante}-${idComune}-${mediaPrezzo}`;

        let hash = 5381;
        for (let i = 0; i < stringaUnivoca.length; i++) {
            hash = ((hash << 5) + hash) + stringaUnivoca.charCodeAt(i);
        }
        const localitaHash = Math.abs(hash);

        // Generatore di accoppiamenti pseudo-casuali deterministici tramite numeri primi (Salt)
        const pick = (arr, salt = 0) => arr[(localitaHash + salt) % arr.length];

        const sAutomobilista = pick(["guidatore", "conducente", "utente della strada", "automobilista della zona"], 17);
        const sContesto = pick(["contesto territoriale", "quadro locale", "tessuto urbano", "perimetro geografico"], 31);
        const sSpesa = pick(["esborso mensile", "bilancio familiare", "costo di gestione", "portafoglio"], 61);
        const sFluttuazioni = pick(["oscillazioni repentine", "variazioni di mercato", "dinamiche di prezzo"], 73);

        // --- SEZIONE 1: 4 Varianti di Apertura in formato JSX ---
        let bloccoSezione1;
        switch ((localitaHash + 101) % 4) {
            case 0:
                bloccoSezione1 = (
                    <>
                        <p className="mb-3">
                            Guidare quotidianamente <strong>{localita}</strong> mette ogni {sAutomobilista} di fronte a
                            una realtà economica in costante mutamento, dove la gestione dei costi di rifornimento
                            diventa un fattore cruciale per il {sSpesa}.
                        </p>
                        <p className="mb-3">
                            Muoversi tra le strade di questa zona, prestando attenzione alle fluttuazioni
                            di <strong>{tipoCarburante}</strong>, comporta un monitoraggio visivo quasi automatico dei
                            cartelli prezzo esposti lungo le carreggiate.
                        </p>
                        <p className="mb-0">
                            Chi si mette al volante può contare su una rete di distribuzione eccezionalmente sviluppata,
                            che vede la presenza complessiva di ben <strong>{totaleImpianti} stazioni di
                            servizio</strong>. Questa capillarità garantisce un punto di rifornimento sempre a portata
                            di mano, ma al contempo genera una frammentazione tariffaria che merita di essere analizzata
                            con attenzione.
                        </p>
                    </>
                );
                break;
            case 1:
                bloccoSezione1 = (
                    <>
                        <p className="mb-3">
                            Per chi si sposta abitualmente <strong>{localita}</strong>, l'andamento dei costi legati
                            a <strong>{tipoCarburante}</strong> rappresenta una delle voci più monitorate nel {sSpesa}.
                        </p>
                        <p className="mb-3">
                            La necessità di individuare soluzioni vantaggiose for la propria vettura spinge i conducenti
                            a confrontare costantemente i listini esposti, specie quando i flussi di traffico
                            giornalieri costringono a frequenti tappe di rifornimento.
                        </p>
                        <p className="mb-0">
                            Il {sContesto} offre una risposta strutturata a questa domanda, grazie a un network
                            complessivo di ben <strong>{totaleImpianti} impianti di erogazione</strong>. Una densità
                            commerciale così marcata moltiplica le opzioni di scelta, accentuando però quei divari
                            economici che rendono indispensabile un esame mirato dei prezzi.
                        </p>
                    </>
                );
                break;
            case 2:
                bloccoSezione1 = (
                    <>
                        <p className="mb-3">
                            La mappa dei rifornimenti stradali <strong>{localita}</strong> riflette fedelmente
                            le {sFluttuazioni} dei mercati energetici globali e locali.
                        </p>
                        <p className="mb-3">
                            In quest'area geografica, ottimizzare la spesa per il rifornimento
                            di <strong>{tipoCarburante}</strong> non è solo un'opportunità, ma una necessità legata alla
                            gestione del {sSpesa}. Attualmente la zona è servita da un circuito capillare composto
                            da <strong>{totaleImpianti} stazioni di rifornimento</strong>.
                        </p>
                        <p className="mb-0">
                            Questa forte concorrenza teorica si traduce sul campo in un ventaglio di offerte commerciali
                            fortemente disomogeneo, che permette ai guidatori più attenti di intercettare margini di
                            risparmio significativi senza stravolgere i propri percorsi di viaggio.
                        </p>
                    </>
                );
                break;
            default:
                bloccoSezione1 = (
                    <>
                        <p className="mb-3">
                            I flussi di traffico che si sviluppano giornalmente <strong>{localita}</strong> si scontrano
                            costantemente con il problema del caro-carburante, focalizzando l'attenzione sulle tariffe
                            di <strong>{tipoCarburante}</strong>.
                        </p>
                        <p className="mb-3">
                            Esaminando da vicino la situazione a livello locale, emerge chiaramente come la vicinanza
                            geografica tra i vari distributori non sia sinonimo di listini identici. Con
                            ben <strong>{totaleImpianti} punti vendita attivi</strong> dislocati sul territorio, la rete
                            offre risposte commerciali molto distanti tra loro.
                        </p>
                        <p className="mb-0">
                            Per ogni {sAutomobilista} diventa quindi prioritario decodificare questa frammentazione per
                            evitare di pagare tariffe fuori mercato e alleggerire l'impatto economico complessivo sul
                            lungo periodo.
                        </p>
                    </>
                );
        }

        // --- SEZIONE 2: 4 Varianti sulla Forbice dei Prezzi in formato JSX ---
        let bloccoSezione2;
        switch ((localitaHash + 131) % 4) {
            case 0:
                bloccoSezione2 = (
                    <>
                        <p className="mb-3">
                            L'elemento che salta subito all'occhio analizzando le cifre macroeconomiche locali è
                            l'estensione della forbice dei <strong>prezzi</strong>, un indicatore chiaro di quanto il
                            mercato libero possa oscillare all'interno del medesimo perimetro.
                        </p>
                        <p className="mb-3">
                            Se consideriamo che il prezzo medio calcolato per l'intera area si attesta
                            a <strong>{mediaPrezzo} euro al litro</strong>, questa cifra rappresenta solo un punto di
                            equilibrio virtuale. La realtà vissuta dai consumatori sul campo è delimitata da due estremi
                            estremamente distanti.
                        </p>
                        <p className="mb-0">
                            La soglia minima viene infatti intercettata a <strong>{minPrezzo} euro al litro</strong>,
                            mentre i picchi arrivano a toccare la quota considerevole di <strong>{maxPrezzo} euro al
                            litro</strong>. Un divario teorico così netto dimostra come il posizionamento commerciale
                            delle stazioni possa variare drasticamente.
                        </p>
                    </>
                );
                break;
            case 1:
                bloccoSezione2 = (
                    <>
                        <p className="mb-3">
                            Il dato numerico più interessante che emerge analizzando il {sContesto} riguarda l'ampiezza
                            dello scarto tra le tariffe minime e massime, un chiaro segnale di competitività
                            asimmetrica. I <strong>prezzi</strong> applicati alla pompa mostrano oscillazioni repentine
                            anche a breve distanza.
                        </p>
                        <p className="mb-3">
                            A fronte di un valore medio registrato nella zona pari a <strong>{mediaPrezzo} euro al
                            litro</strong>, las reali opportunità si nascondono nei dettagli delle singole stazioni.
                        </p>
                        <p className="mb-0">
                            La tariffa d'ingresso più competitiva si posiziona infatti a quota <strong>{minPrezzo} euro
                            al litro</strong>, lasciando a grande distanza i picchi massimi rilevati, che si spingono
                            fino a <strong>{maxPrezzo} euro al litro</strong> nelle tratte ad alto scorrimento stradale.
                        </p>
                    </>
                );
                break;
            case 2:
                bloccoSezione2 = (
                    <>
                        <p className="mb-3">
                            Prendendo in esame le statistiche correnti della zona, notiamo che lo scarto tra i prezzi
                            minimi e massimi è l'ago della bilancia per il risparmio. Il valore medio teorico rilevato è
                            di <strong>{mediaPrezzo} euro al litro</strong>, ma è un dato che nasconde una forte
                            polarizzazione commerciale.
                        </p>
                        <p className="mb-3">
                            Da un lato abbiamo stazioni d'eccellenza che bloccano il prezzo a <strong>{minPrezzo} euro
                            al litro</strong>, dall'altro impianti meno economici che sfiorano picchi
                            di <strong>{maxPrezzo} euro al litro</strong>.
                        </p>
                        <p className="mb-0">
                            Questa asimmetria mette in luce l'importanza di non fermarsi al primo distributore sul
                            percorso, poiché la pianificazione della sosta incide direttamente sul {sSpesa} complessivo
                            delle famiglie.
                        </p>
                    </>
                );
                break;
            default:
                bloccoSezione2 = (
                    <>
                        <p className="mb-3">
                            Analizzare la forbice dei costi locali è il primo passo per comprendere le dinamiche
                            dei <strong>prezzi</strong> in questa porzione di territorio. La media matematica si attesta
                            attualmente a <strong>{mediaPrezzo} euro al litro</strong>, ma la vera operatività
                            commerciale si gioca su estremi opposti.
                        </p>
                        <p className="mb-3">
                            La base di partenza orientata al risparmio si attesta a <strong>{minPrezzo} euro al
                            litro</strong>, mentre i rifornimenti effettuati nelle stazioni meno competitive possono
                            arrivare a costare fino a <strong>{maxPrezzo} euro al litro</strong>.
                        </p>
                        <p className="mb-0">
                            Si tratta di differenze centesimali che, moltiplicate per la capacità di un serbatoio medio,
                            ridefiniscono completamente i concetti di convenienza e posizionamento della zona.
                        </p>
                    </>
                );
        }

        // --- SEZIONE 4: 3 Varianti sulla Modalità di Erogazione in formato JSX ---
        let bloccoSezione4;
        switch ((localitaHash + 151) % 3) {
            case 0:
                bloccoSezione4 = (
                    <p className="mb-3">
                        Un altro fattore strutturale che influisce pesantemente sul prezzo finale esposto è la modalità
                        di erogazione scelta dall'utente al momento della sosta. La transizione della rete distributiva
                        verso l'automazione ha ridefinito le abitudini di consumo, spingendo la maggior parte degli
                        impianti della zona a potenziare l'offerta legata al <strong>"Fai da te"</strong>. Molti dei
                        punti vendita analizzati offrono ormai una doppia opzione, consentendo di accedere alla tariffa
                        minima solo se si accetta di utilizzare in autonomia la colonnina di pagamento automatico.
                    </p>
                );
                break;
            case 1:
                bloccoSezione4 = (
                    <p className="mb-3">
                        Sul costo finale del rifornimento incide in maniera determinante anche la componente logistica
                        legata al servizio di piazzale. La progressiva diffusione delle corsie automatizzate ha
                        modificato profondamente le preferenze degli utenti, orientati sempre più verso formule
                        di <strong>"Self-Service"</strong> for catturare i prezzi più vantaggiosi. L'accesso ai listini
                        minimi della zona è quasi ovunque subordinato all'utilizzo autonomo della colonnina di
                        erogazione, lasciando le corsie servite a tariffe nettamente superiori.
                    </p>
                );
                break;
            default:
                bloccoSezione4 = (
                    <p className="mb-3">
                        Non si può sottovalutare l'impatto della scelta tra corsia 'Fai da te' e corsia 'Servito' sulla
                        spesa finale alla pompa. Il mercato locale spinge con forza verso l'automazione dei piazzali: i
                        gestori tendono ad abbassare i margini di guadagno esclusivamente sulle
                        colonnine <strong>Self-Service</strong> per attirare i flussi di clienti. Scegliere la comodità
                        dell'assistenza del personale significa quasi sempre allinearsi istantaneamente sulla fascia di
                        prezzo più alta della forbice locale.
                    </p>
                );
        }

        let insightRisparmio = "";
        if (parseFloat(risparmioPieno) > 6.00) {
            insightRisparmio = `Dato l'elevato livello di frammentazione dei prezzi in questa area geografica, la convenienza locale è eccezionalmente alta. Lo scostamento tra i gestori è così marcato da giustificare una deviazione dal proprio percorso abituale pur di raggiungere le pompe più economiche.`;
        } else {
            insightRisparmio = `La concorrenza locale mantiene i prezzi abbastanza compatti e vicini alla media territoriale. Nonostante ciò, l'accumulo di piccoli risparmi su base mensile garantisce comunque un ritorno economico da non sottovalutare per chi usa il veicolo ogni giorno.`;
        }

        return {
            localita, tipoCarburante, mediaPrezzo, minPrezzo, maxPrezzo, dataAgg,
            minLocale, maxLocale, deltaPrezzoLocale, risparmioPieno, massimoRisparmio, dettagliMarchi, haPompeBianche,
            totaleImpianti, bloccoSezione1, bloccoSezione2, bloccoSezione4, insightRisparmio, marchioFiltroSingolo
        };
    };

    const dati = generaDatiEGuida(riepilogo, distributori);

    if (!dati) {
        return (
            <div className="alert alert-danger my-4" role="alert">
                Ops! Al momento non abbiamo abbastanza dati per mostrarti la guida ai prezzi. Riprova più tardi!
            </div>
        );
    }

    return (
        <div className="py-2">

            <h2 className={'h4'}>{titoloPagina}</h2>
            <p className="text-muted small mb-4">
                Analisi indipendente e consigli pratici basati sui dati ufficiali del <strong>{dati.dataAgg}</strong> e
                monitorati in tempo reale secondo le ultime rilevazioni disponibili.
            </p>

            {/* Tabella riassuntiva dei costi */}
            <section className="mb-4">
                <h2 className="h5 text-primary mb-3 fw-normal">📊 Quadro generale dei prezzi {dati.localita}</h2>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle ">
                        <thead className="table-light text-uppercase">
                        <tr>
                            <th scope="col"><span className={'fw-normal small'}>Prezzo alla pompa</span></th>
                            <th scope="col"><span className={'fw-normal small'}>Impatto sul Pieno (50L)</span></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><strong className="text-success">{dati.minPrezzo} €</strong></td>
                            <td className="text-muted">Il massimo risparmio possibile oggi</td>
                        </tr>
                        <tr>
                            <td><strong>{dati.mediaPrezzo} €</strong></td>
                            <td className="text-muted">La tariffa media di riferimento della zona</td>
                        </tr>
                        <tr>
                            <td><strong className="text-danger">{dati.maxPrezzo} €</strong></td>
                            <td className="text-muted">Da evitare se vuoi ottimizzare la spesa</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Blocco Evidenziato Callout */}
            <div className="alert alert-info border-start border-info border-4 p-4 mb-4" role="alert">
                <h3 className="h6 fw-bold mb-2">💡 Il calcolo in tasca:</h3>
                <p className="">
                    Scegliendo con attenzione l'impianto più conveniente rispetto alla media,
                    risparmi ben <strong>{dati.deltaPrezzoLocale} € per ogni singolo litro</strong>.
                    Significa che su un pieno da 50 litri ti restano in tasca ben <strong
                    className="text-dark">{dati.risparmioPieno} € netti</strong> in un colpo solo!
                </p>
                <p className=" small">{dati.insightRisparmio}</p>
                <p className="mb-0">Facendo il confronto con il massimo prezzo rilevato, il risparmio sale a <strong
                    className='fs-2'>{dati.massimoRisparmio} €</strong>.</p>
            </div>

            <Display6977770298 className={'mb-4'}/>

            {/* Corpo del Report strutturato */}
            <main className="">

                <section className="mb-4">
                    <h2 className="h5 text-uppercase">1. La mappa dei carburanti {dati.localita}</h2>
                    <div className="lh-base ">{dati.bloccoSezione1}</div>
                </section>

                <Display6977770298/>

                <hr className="my-4 text-muted"/>
                <section className="mb-4">
                    <h2 className="h5 text-uppercase">2. Capire la forbice dei prezzi per non sbagliare</h2>
                    <div className="lh-base ">{dati.bloccoSezione2}</div>
                    <p className="mt-3">
                        Se proiettiamo questo scostamento sul lungo periodo, la scelta strategica del posto giusto in
                        cui fermarsi
                        si traduce immediatamente in un vantaggio economico strutturato, capace di alleggerire
                        sensibilmente l'impatto dei rifornimenti ricorrenti.
                    </p>
                </section>

                <Display6977770298/>
                <hr className="my-4 text-muted"/>

                {/* ================================================================= */}
                {/* SEZIONE 3 VARIABILE: FILTRO MARCHIO SINGOLO VS MULTI-MARCHIO     */}
                {/* ================================================================= */}
                <section className="mb-4">
                    <h2 className="h5 text-uppercase">3. Analisi della concorrenza e dei marchi presenti</h2>

                    {dati.marchioFiltroSingolo ? (
                        <>
                            <p className="mb-3">
                                Questa pagina è focalizzata in modo specifico sul monitoraggio e sull'analisi della rete
                                di punti vendita a marchio <strong>{dati.marchioFiltroSingolo}</strong> attivi nel
                                perimetro <strong>{dati.localita}</strong>.
                                La scelta di un unico brand permette di comprendere a fondo le strategie di
                                posizionamento della compagnia all'interno della zona, dove i
                                singoli <strong>distributori</strong> gestiti dall'insegna cercano di adattarsi ai
                                flussi commerciali locali.
                            </p>
                            <p className="mb-3">
                                Anche all'interno dello stesso marchio storico, i listini alla pompa per il servizio
                                di <strong>{dati.tipoCarburante}</strong> non sono uniformi. Le politiche tariffarie
                                applicate risentono pesantemente del posizionamento micro-logistico di ciascuna stazione
                                (vicinanza a tangenziali, grandi arterie cittadine o centri commerciali), traducendosi
                                in oscillazioni di prezzo sensibili da un impianto all'altro.
                            </p>
                            <p className="mb-0">
                                Monitorare le diverse stazioni di <strong>{dati.marchioFiltroSingolo}</strong> presenti
                                nel campione consente agli automobilisti fidelizzati a questa specifica insegna di
                                individuare l'isola di rifornimento più <strong>conveniente</strong> e strategica,
                                ottimizzando la spesa senza dover cambiare la propria carta carburante o rinunciare ai
                                servizi integrati del brand.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="mb-3">
                                La spiegazione di questa marcata asimmetria tariffaria risiede principalmente nella
                                struttura
                                della concorrenza e nella varietà dei marchi commerciali che si spartiscono il
                                territorio, dove i diversi <strong>distributori</strong> cercano di adattarsi e
                                posizionarsi
                                strategicamente lungo i flussi di traffico principali.
                            </p>
                            <p>
                                La mappa dei loghi petroliferi vede la coesistenza di operatori tradizionali ben
                                insediati, tra
                                cui spiccano insegne note come <span
                                dangerouslySetInnerHTML={{__html: dati.dettagliMarchi}}/>.
                            </p>
                            {dati.haPompeBianche ? (
                                <p className="mb-0">
                                    Accanto a questi colossi storici della vendita al dettaglio, gioca un ruolo
                                    fondamentale la
                                    presenza delle cosiddette <strong>"Pompe Bianche"</strong>, ovvero stazioni di
                                    servizio
                                    indipendenti e prive di un brand multinazionale da finanziare. Le pompe no-logo,
                                    sfruttando
                                    costi di gestione più snelli e l'assenza di pesanti investimenti pubblicitari,
                                    riescono a
                                    posizionarsi sul mercato con le tariffe in assoluto
                                    più <strong>convenienti</strong> della
                                    zona. Questo fenomeno genera
                                    una forte spinta competitiva, poiché la loro vicinanza costringe i marchi
                                    tradizionali
                                    circostanti a rivedere i propri listini al ribasso per non perdere clienti.
                                </p>
                            ) : (
                                <>
                                    <p className="">
                                        In questo specifico contesto territoriale, la competizione si gioca interamente
                                        sul
                                        posizionamento strategico dei <strong>grandi marchi storici</strong> per
                                        risultare i
                                        più <strong>convenienti</strong> possibili alle auto di passaggio.
                                        Non essendoci una forte incidenza di distributori indipendenti o no-logo nel
                                        campione
                                        analizzato, sono le stesse compagnie principali a sfidarsi a colpi di centesimi
                                        sul filo
                                        del rasoio.
                                    </p>
                                    <p>
                                        Questa dinamica spinge i singoli gestori delle stazioni di punta a differenziare
                                        pesantemente i prezzi tra loro,
                                        basandosi sul volume di traffico della via o sulla vicinanza ad altre insegne
                                        rivali per
                                        accaparrarsi le quote di mercato locali.
                                    </p>
                                </>
                            )}
                        </>
                    )}
                </section>

                <Display6977770298/>
                <hr className="my-4 text-muted"/>

                <section className="mb-4">
                    <h2 className="h5 text-uppercase">4. L'importanza della modalità: Self-Service vs Servito</h2>
                    <div className="lh-base ">{dati.bloccoSezione4}</div>
                </section>

                <Display6977770298/>

                {/* Card Strategie */}
                <section className="card bg-white p-4 my-4">
                    <h2 className="h6 text-uppercase">🎯 Strategie Avanzate di Risparmio</h2>
                    <p className="text-muted small mb-3">Metti in pratica questi tre pilastri fondamentali ogni volta
                        che sei alla guida:</p>

                    <div className="mb-3">
                        <h3 className="h6 fw-bold text-primary mb-1">A. Pianifica le soste strategiche</h3>
                        <p className="mb-0 small ">
                            I <strong>distributori</strong> più convenienti tendono a concentrarsi lungo le arterie ad
                            alto flusso
                            commerciale o nei pressi di snodi logistici. Evita di fare rifornimento in autostrada o in
                            vie residenziali isolate se vuoi risparmiare.
                        </p>
                    </div>

                    <div className="mb-3">
                        <h3 className="h6 fw-bold text-primary mb-1">B. Sfrutta l'effetto specchio</h3>
                        <p className="mb-0 small ">
                            Quando vedi due o tre stazioni vicine sullo stesso asse stradale, la guerra dei centesimi
                            tra i gestori è spietata per accaparrarsi i clienti di passaggio. Approfittane sempre
                            svoltando sul lato più conveniente.
                        </p>
                    </div>

                    <div>
                        <h3 className="h6 fw-bold text-primary mb-1">C. Non ridurti mai alla riserva</h3>
                        <p className="mb-0 small ">
                            Viaggiare con la spia accesa ti costringe a fermarti al primo distributore disponibile che
                            incontri sul tragitto, togliendoti il potere di scegliere la tariffa migliore e
                            obbligandoti, purtroppo, a pagare i prezzi massimi.
                        </p>
                    </div>
                </section>

            </main>

            <footer className="mt-5 pt-3 border-top border-light text-center text-muted small">
                Le informazioni macro-territoriali fornite si basano sulle elaborazioni dei dati ufficiali messi a
                disposizione dai gestori della zona. Buon viaggio e guida con prudenza!
            </footer>
        </div>
    );
};


export {GuidaCarburantiAutomobilistaVER3};