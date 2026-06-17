import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import Display6977770298 from "./ads/Display-6977770298";

const GuidaCarburantiAutomobilista = ({riepilogo, distributori}) => {

    const generaDatiEGuida = (datiRiepilogo, listaDistributori) => {
        if (!datiRiepilogo || !listaDistributori || listaDistributori.length === 0) {
            return null;
        }

        const infoRichiesta = datiRiepilogo.request || {};
        const comune = infoRichiesta.comune?.description || "tua zona";
        const provincia = infoRichiesta.provincia_descrizione || "Roma";
        const tipoCarburante = (infoRichiesta.carburante || "Benzina").toLowerCase();

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

        // Controlliamo dinamicamente se tra i marchi o i distributori figurano indipendenti o "No Logo"
        const haPompeBianche = marchi.some(m =>
            m.marchio?.toLowerCase().includes("no logo") ||
            m.marchio?.toLowerCase().includes("bianca") ||
            m.marchio?.toLowerCase().includes("indipendente")
        ) || listaDistributori.some(d => d.properties.bandiera?.toLowerCase().includes("no logo"));

        const dettagliMarchi = marchi
            .filter(m => m.marchio !== "Tutti")
            .map(m => `<strong>${m.marchio}</strong> (con ${m.impianti} distributori)`)
            .join(", ");

        const localita = datiRiepilogo.localita;

        return {
            localita,
            comune, provincia, tipoCarburante, mediaPrezzo, minPrezzo, maxPrezzo, dataAgg,
            minLocale, maxLocale, deltaPrezzoLocale, risparmioPieno, massimoRisparmio, dettagliMarchi, haPompeBianche,
            totaleImpianti: datiRiepilogo.totaleImpianti || listaDistributori.length
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
        <div className="container py-2">

            <p className="text-muted small mb-4">
                Analisi indipendente e consigli pratici basati sui dati ufficiali del <strong>{dati.dataAgg}</strong>.
            </p>

            {/* Tabella riassuntiva dei costi (Inizia la gerarchia da H2) */}
            <section className="mb-4">
                <h2 className="h5 text-primary mb-3">📊 Quadro generale dei prezzi {dati.localita}</h2>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle">
                        <thead className="table-light">
                        <tr>
                            <th scope="col">Parametro</th>
                            <th scope="col">Prezzo</th>
                            <th scope="col">Impatto sul Pieno (50L)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><span className="me-2"><CircleIcon className={'text-success'}
                                                                   fontSize={'small'}/></span> Minimo Assoluto
                            </td>
                            <td><strong className="text-success">{dati.minPrezzo} €</strong></td>
                            <td className="text-muted">Il massimo risparmio possibile</td>
                        </tr>
                        <tr>
                            <td><span className="me-2"><CircleIcon fontSize={'small'}/></span> Media Territoriale</td>
                            <td><strong>{dati.mediaPrezzo} €</strong></td>
                            <td className="text-muted">La tariffa di riferimento della zona</td>
                        </tr>
                        <tr>
                            <td><span className="me-2"><CircleIcon className={'text-danger'}
                                                                   fontSize={'small'}/></span> Massimo Rilevato
                            </td>
                            <td><strong className="text-danger">{dati.maxPrezzo} €</strong></td>
                            <td className="text-muted">Da evitare se vuoi risparmiare</td>
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
                <p>Facendo il confronto con il massimo prezzo rilevato, il risparmio sale a <strong
                    className='fs-2'>{dati.massimoRisparmio} €</strong>.</p>
            </div>

            <Display6977770298 className={'mb-4'}/>

            {/* Corpo del Report strutturato */}
            <main className="text-justify lh-base">

                <section className="mb-4">
                    <h2 className="h4 text-secondary mb-3">1. La mappa dei carburanti {dati.localita}</h2>
                    <p className="mb-3">
                        Guidare quotidianamente nel territorio di <strong>{dati.comune}</strong>, all'interno del
                        contesto provinciale di <strong>{dati.provincia}</strong>, mette ogni automobilista di fronte a
                        una realtà economica in costante mutamento, dove la gestione dei costi di rifornimento diventa
                        un fattore cruciale per il bilancio familiare o aziendale. Muoversi tra le strade di questa
                        zona, sia per ragioni di pendolarismo lavorativo sia per semplici spostamenti privati, comporta
                        un monitoraggio visivo quasi automatico dei cartelli prezzo esposti lungo le carreggiate.
                    </p>
                    <p className="mb-0">
                        Chi si mette al volante può contare su una rete di distribuzione eccezionalmente sviluppata, che
                        vede la presenza complessiva di ben <strong>{dati.totaleImpianti} stazioni di servizio</strong>.
                        Questa capillarità territoriale garantisce che un punto di rifornimento sia sempre a portata di
                        mano, ma al contempo genera una frammentazione tariffaria che merita di essere analizzata con
                        attenzione per evitare inutili sprechi al momento del rifornimento.
                    </p>
                </section>

                <Display6977770298/>

                <hr className="my-4 text-muted"/>
                <section className="mb-4">
                    <h2 className="h4 text-secondary mb-3">2. Capire la forbice dei prezzi per non sbagliare</h2>
                    <p className="mb-3">
                        L'elemento che salta subito all'occhio analizzando le cifre macroeconomiche locali è
                        l'estensione della forbice dei prezzi, un indicatore chiaro di quanto il mercato libero possa
                        oscillare all'interno dello stesso perimetro comunale. Se consideriamo che il prezzo medio
                        calcolato per l'intera area urbana si attesta a <strong>{dati.mediaPrezzo} euro al
                        litro</strong>, questa cifra rappresenta solo un punto di equilibrio virtuale. La realtà vissuta
                        dai consumatori sul campo è delimitata da due estremi estremamente distanti.
                    </p>
                    <p className="mb-0">
                        La soglia minima di ingresso del carburante viene infatti intercettata
                        a <strong>{dati.minPrezzo} euro al litro</strong>, mentre i picchi più elevati arrivano a
                        toccare la quota considerevole di <strong>{dati.maxPrezzo} euro al litro</strong>. Si parla di
                        un divario teorico complessivo che dimostra come il posizionamento commerciale di alcune
                        stazioni di servizio possa variare drasticamente. Per un utente che si limita a fare un
                        rifornimento parziale la differenza può sembrare minima, ma se proiettiamo questo scostamento
                        sul lungo periodo, la scelta del posto giusto si traduce immediatamente in un risparmio
                        tangibile e strutturato.
                    </p>
                </section>

                <Display6977770298/>
                <hr className="my-4 text-muted"/>

                <section className="mb-4">
                    <h2 className="h4 text-secondary mb-3">3. Analisi della concorrenza e dei marchi presenti</h2>
                    <p className="mb-3">
                        La spiegazione di questa marcata asimmetria tariffaria risiede principalmente nella struttura
                        della concorrenza locale e nella varietà dei marchi commerciali che si spartiscono il
                        territorio. La mappa dei loghi petroliferi in questa zona vede la coesistenza di diversi
                        operatori, tra cui spiccano insegne note come <span
                        dangerouslySetInnerHTML={{__html: dati.dettagliMarchi}}/>.
                    </p>
                    {dati.haPompeBianche ? (
                        <p className="mb-0">
                            Accanto a questi colossi storici della vendita al dettaglio, gioca un ruolo fondamentale la
                            presenza delle cosiddette <strong>"Pompe Bianche"</strong>, ovvero stazioni di servizio
                            indipendenti e prive di un brand multinazionale da finanziare. Le pompe no-logo, sfruttando
                            costi di gestione più snelli e l'assenza di pesanti investimenti pubblicitari, riescono a
                            posizionarsi sul mercato con le tariffe più aggressive della zona. Questo fenomeno genera
                            una forte spinta competitiva, poiché la loro vicinanza costringe i marchi tradizionali
                            circostanti a rivedere i propri listini al ribasso per non perdere clienti.
                        </p>
                    ) : (
                        <p className="mb-0">
                            In questo specifico contesto territoriale, la competizione si gioca interamente sul
                            posizionamento strategico dei <strong>grandi marchi storici</strong>. Non essendoci una
                            forte incidenza di distributori indipendenti o no-logo nel campione analizzato, sono le
                            stesse compagnie principali a sfidarsi a colpi di centesimi. Questa dinamica spinge i
                            singoli gestori delle stazioni di punta a differenziare pesantemente i prezzi tra loro,
                            basandosi sul volume di traffico della via o sulla vicinanza ad altre insegne rivali per
                            accaparrarsi le quote di mercato locali.
                        </p>
                    )}
                </section>

                <Display6977770298/>
                <hr className="my-4 text-muted"/>

                <section className="mb-4">
                    <h2 className="h4 text-secondary mb-3">4. L'importance della modalità: Self-Service vs Servito</h2>
                    <p className="mb-3">
                        Un altro fattore strutturale che influisce pesantemente sul prezzo finale esposto è la modalità
                        di erogazione scelta dall'utente al momento della sosta. La transizione della rete distributiva
                        verso l'automazione ha ridefinito le abitudini di consumo, spingendo la maggior parte degli
                        impianti della zona a potenziare l'offerta legata al <strong>"Fai da te"</strong>. Molti dei
                        punti vendita analizzati offrono ormai una doppia opzione, consentendo di accedere alla tariffa
                        minima solo se si accetta di scendere dall'auto e utilizzare la colonnina di pagamento
                        automatico.
                    </p>
                    <p className="mb-0">
                        Il servizio assistito sul piazzale, pur mantenendo una sua utilità per fasce di utenza
                        specifiche o per chi cerca comfort, sconta inevitabilmente il costo del lavoro del personale e
                        tende ad allinearsi sui valori massimi della forbice tariffaria. Sapere in anticipo se un
                        impianto è strutturato come un sistema completamente automatizzato o se offre un presidio misto
                        permette al guidatore di approcciare l'area di rifornimento con una chiara consapevolezza della
                        spesa a cui va incontro.
                    </p>
                </section>

                <Display6977770298/>

                {/* Card Bootstrap per l'elenco dei pilastri (Strutturato con H2 -> H3) */}
                <section className="card bg-white p-4 my-4">
                    <h2 className="h4 text-dark mb-3">🎯 Strategie Avanzate di Risparmio</h2>
                    <p className="text-muted small mb-3">Metti in pratica questi tre pilastri fondamentali ogni volta
                        che sei alla guida:</p>

                    <div className="mb-3">
                        <h3 className="h6 fw-bold text-primary mb-1">A. Pianifica le soste strategiche</h3>
                        <p className="mb-0 small text-secondary">
                            I distributori più convenienti tendono a concentrarsi lungo le arterie ad alto flusso
                            commerciale o nei pressi di snodi logistici. Evita di fare rifornimento in autostrada o in
                            vie residenziali isolate se vuoi risparmiare.
                        </p>
                    </div>

                    <div className="mb-3">
                        <h3 className="h6 fw-bold text-primary mb-1">B. Sfrutta l'effetto specchio</h3>
                        <p className="mb-0 small text-secondary">
                            Quando vedi due o tre stazioni vicine sullo stesso asse stradale, la guerra dei centesimi
                            tra i gestori è spietata per accaparrarsi i clienti di passaggio. Approfittane sempre
                            svoltando sul lato più conveniente.
                        </p>
                    </div>

                    <div>
                        <h3 className="h6 fw-bold text-primary mb-1">C. Non ridurti mai alla riserva</h3>
                        <p className="mb-0 small text-secondary">
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

export default GuidaCarburantiAutomobilista;