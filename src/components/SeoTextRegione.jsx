import {getLink} from "@/functions/api";

export default function SeoTextRegione({ data }) {
    const { regione, carburanti, comuni, marchi, totaleImpianti, dataAggiornamento } = data;
    const regioneCap = regione.charAt(0).toUpperCase() + regione.slice(1);
    const aggiornamento = new Date(dataAggiornamento).toLocaleDateString('it-IT');

    const carburanteKeys = Object.keys(carburanti);
    const unicoCarburante = carburanteKeys.length === 1 ? carburanteKeys[0] : null;
    const primaCitta = comuni?.[0]?.nome || 'il tuo comune';
    const fuelForLinks = (unicoCarburante || 'benzina').toLowerCase();

    const getUnita = (tipo) => (tipo.toLowerCase() === 'metano' ? '€/kg' : '€/L');

    return (
        <section className="seo-text text-start">

            {unicoCarburante && (
                <h2 className="h4 mb-3">Prezzi {unicoCarburante} in {regioneCap}: guida completa ai distributori</h2>
                )}
            {!unicoCarburante && (
            <h2 className="h4 mb-3">Prezzi carburante in {regioneCap}: guida completa ai distributori</h2>)}

            <p>
                In <strong>{regioneCap}</strong> sono attivi <strong>{totaleImpianti}</strong> distributori, distribuiti tra capoluoghi e comuni minori: una rete capillare che consente di confrontare rapidamente prezzi, marchi e tipologie di impianto. Questa pagina raccoglie i <strong>prezzi aggiornati</strong> e i dati principali sui carburanti disponibili, così puoi individuare il punto di rifornimento più conveniente vicino a te. Aggiornamento dati: <strong>{aggiornamento}</strong>.
            </p>

            <p>
                Se ti interessa ottimizzare ogni pieno, qui trovi una panoramica chiara dei livelli di prezzo, con indicazioni su <strong>minimi, massimi e medie</strong> per ciascun carburante. Le informazioni sono pensate per aiutarti a scegliere tra <em>self-service</em> e <em>servito</em>, individuare i marchi più presenti e navigare verso le aree con maggiore concentrazione di impianti.
            </p>

            {!unicoCarburante && (
                <>
                    <h2 className="h5 mt-4 mb-3">Panoramica dei prezzi per tipo di carburante</h2>
                    {carburanteKeys.map((tipo) => {
                        const c = carburanti[tipo];
                        const unita = getUnita(tipo);
                        return (
                            <p key={tipo}>
                                🔹 <strong>{tipo}</strong>: disponibile in <strong>{c.impianti}</strong> impianti, con un prezzo medio di <strong>{c.media} {unita}</strong>. Il minimo registrato è <strong>{c.min} {unita}</strong>, mentre il massimo raggiunge <strong>{c.max} {unita}</strong>. Per chi cerca {tipo.toLowerCase()} conveniente in {regioneCap}, il confronto tra impianti e marchi è la leva più efficace per risparmiare in modo costante.
                            </p>
                        );
                    })}
                </>
            )}

            {unicoCarburante && (
                <>
                    <h2 className="h5 mt-4 mb-3">Focus {unicoCarburante} in {regioneCap}</h2>
                    <p>
                        In questa pagina trovi un focus dedicato a <strong>{unicoCarburante}</strong>, con dati aggiornati e confronti utili per pianificare il rifornimento. La disponibilità è distribuita tra aree urbane e extraurbane, e la differenza tra <em>self-service</em> e <em>servito</em> può incidere sensibilmente sul prezzo finale.
                    </p>
                    {(() => {
                        const c = carburanti[unicoCarburante];
                        const unita = getUnita(unicoCarburante);
                        return (
                            <p>
                                Attualmente, il prezzo medio di <strong>{unicoCarburante}</strong> è pari a <strong>{c.media} {unita}</strong>, con un minimo rilevato di <strong>{c.min} {unita}</strong> e un massimo di <strong>{c.max} {unita}</strong>, distribuiti su <strong>{c.impianti}</strong> impianti. Valori così ampi suggeriscono che il confronto tra zone e marchi resta determinante per trovare il miglior affare.
                            </p>
                        );
                    })()}
                    <p>
                        Per ridurre la spesa nel tempo, prediligi orari con minore affluenza, valuta stazioni in aree extraurbane e confronta i prezzi lungo i tuoi percorsi abituali. Se disponibili, sfrutta programmi fedeltà o pagamenti digitali con cashback: piccole differenze ripetute su molti pieni producono risparmi significativi.
                    </p>
                    <p>
                        Monitora l’andamento settimanale: leggere variazioni possono indicare trend locali, promozioni temporanee o aggiornamenti dei listini. Quando possibile, pianifica il rifornimento prima di lunghi spostamenti per evitare aree notoriamente più care, come tratte autostradali o zone a bassa densità di impianti.
                    </p>
                </>
            )}

            <h2 className="h5 mt-4 mb-3">Marchi più presenti in {regioneCap}</h2>
            <p>
                In regione sono attivi i seguenti marchi:
                {marchi.map((m, i) => (
                    <span key={m.marchio}>
            {' '}
                        <strong>{m.marchio}</strong> ({m.impianti} impianti)
                        {i < marchi.length - 1 ? ',' : '.'}
          </span>
                ))}{' '}
                Le differenze di prezzo tra brand possono dipendere da politiche commerciali, servizi offerti (come lavaggio, shop o assistenza) e localizzazione. Il confronto diretto tra impianti vicini resta la strategia più efficace per individuare l’opzione più conveniente.
            </p>

            <h2 className="h5 mt-4 mb-3">Comuni con più distributori</h2>
            <p>
                Le aree con maggiore densità di impianti facilitano il confronto e spesso offrono più alternative in termini di orari e servizi. Scopri i distributori nei comuni più serviti:
                {comuni.map((c, i) => {

                    const link = getLink(regione, fuelForLinks, null, c.provincia, c.key)


                    return <span key={c.nome}>
            {' '}
                        <a href={link.link}>{c.nome}</a> ({c.impianti})
                        {i < comuni.length - 1 ? ',' : '.'}
          </span>
                })}
            </p>

            <h2 className="h5 mt-4 mb-3">Come usare al meglio questa pagina</h2>
            <p>
                Usa la mappa per una vista immediata dei distributori attivi, poi apri le schede per verificare prezzo, indirizzo, orari e tipo di impianto. I filtri ti aiutano a restringere la ricerca per carburante e marchio, mentre l’ordinamento per prezzo o distanza rende rapido il confronto. Ogni pagina comunale offre un dettaglio locale con link interni SEO-friendly per navigare tra carburanti e zone.
            </p>

            <p>
                Se ti sposti spesso, salva tra i preferiti le pagine dei tuoi percorsi abituali e confronta i prezzi prima di partire. Confrontare regolarmente due o tre stazioni vicine al tragitto casa–lavoro è una pratica semplice che, nel corso dell’anno, può tradursi in un risparmio concreto, senza rinunciare a qualità e servizi.
            </p>

            <p>
                Inizia ora: esplora i comuni più serviti, confronta i marchi e trova il miglior prezzo in {regioneCap}. I dati sono aggiornati al <strong>{aggiornamento}</strong>. Ogni rifornimento informato è un passo verso una spesa più efficiente.
            </p>
        </section>
    );
}
