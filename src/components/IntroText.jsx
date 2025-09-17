import React from 'react';

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
}

function formatEuro(val) {
    if (!val) return 'n.d.';
    const num = parseFloat(val.replace(',', '.'));
    return isNaN(num) ? 'n.d.' : num.toFixed(3).replace('.', ',') + ' €/litro';
}

function formatDate(iso) {
    if (!iso) return 'data non disponibile';
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

export function IntroTextVersione2({data, distributori, children}) {

    console.log(data);
    console.log(distributori);

    const {request, carburanti, marchi = [], comuni = [], regione, totaleImpianti, dataAggiornamento} = data;
    const scope = request.comune
        ? {livello: 'comune', valore: request.comune}
        : request.provincia
            ? {livello: 'provincia', valore: request.provincia}
            : {livello: 'regione', valore: request.regione || regione};

    const carburante = request.carburante.toLowerCase();
    const carburanteLabel = capitalize(carburante);
    const stats = carburanti[carburante] || {};
    const marchio = data.marchio ? data.marchio.nome : null;
    const dataFormatted = formatDate(dataAggiornamento);
    const localita =
        scope.livello === 'comune'
            ? `a ${capitalize(scope.valore)}`
            : scope.livello === 'provincia'
                ? `in provincia di ${capitalize(scope.valore)}`
                : `in ${capitalize(scope.valore)}`;
    const marchioImpianti = marchio ? marchi.find(m => m.marchio.toUpperCase() === marchio)?.impianti : null;

    const noResults = distributori.length === 0;

    return (
        <section className="intro-text">
            <h1>Prezzi {carburante} {marchio ? ` ${marchio}` : ''} {localita}</h1>
            <p className="lead text-muted">
                Scopri i <strong>prezzi</strong> aggiornati della <strong>{carburante}</strong> {marchio ?
                <strong>{marchio}</strong> : ''} {localita} e pianifica il tuo rifornimento in modo intelligente.
            </p>

            {noResults ? (
                <>
                    <p>
                        Al momento non sono
                        disponibili <strong>distributori</strong> di <strong>{carburante}</strong> {marchio ?
                        <strong>{marchio}</strong> : ''} {localita}. I dati potrebbero essere in fase di aggiornamento
                        oppure non ci sono impianti attivi che corrispondono ai criteri selezionati. Ti consigliamo di
                        verificare altre zone o carburanti per trovare le opzioni più adatte alle tue esigenze.
                    </p>
                    <p>
                        La mappa viene aggiornata regolarmente e include informazioni dettagliate sui <strong>prezzi
                        carburante</strong>, promozioni e disponibilità. Torna a visitarci per scoprire eventuali novità
                        su <strong>{carburanteLabel}</strong> {marchio ? <strong>{marchio}</strong> : ''} {localita}. I
                        dati sono aggiornati al <strong>{dataFormatted}</strong>.
                    </p>
                </>
            ) : (<>


                {children}
                <p>
                    Se stai cercando i <strong>prezzi</strong> della <strong>{carburante}</strong> {marchio ?
                    <strong>{marchio}</strong> : ''} {localita}, sei nel posto giusto. La nostra mappa interattiva ti
                    permette di visualizzare in tempo reale tutti gli impianti attivi, confrontare i prezzi e scegliere
                    il distributore più conveniente.
                </p>
                <p>
                    Il prezzo medio
                    della <strong>{carburante}</strong> {localita} è di <strong>{formatEuro(stats.media)}</strong>,
                    con un minimo di <strong>{formatEuro(stats.min)}</strong> e un massimo
                    di <strong>{formatEuro(stats.max)}</strong>. Grazie alla concorrenza tra marchi
                    come {marchi.slice(0, 3).map((m, i, arr) => (
                    <strong key={m.marchio}>
                        {m.marchio}{i < arr.length - 1 ? ', ' : ''}
                    </strong>
                ))} e alla presenza capillare del marchio{marchio ? <strong> {marchio}</strong> : ''}, puoi trovare
                    facilmente l’offerta più vantaggiosa per il tuo rifornimento.
                </p>
                <p>
                    I dati sono aggiornati
                    al <strong>{dataFormatted}</strong>, garantendo trasparenza e affidabilità.
                </p>
                <p>
                    Nella {scope.livello} di <strong>{capitalize(scope.valore)}</strong> sono
                    attivi <strong>{totaleImpianti || 'numerosi'}</strong> impianti, e molti di essi offrono servizi
                    aggiuntivi come sconti, programmi fedeltà e promozioni stagionali. Se sei fedele al
                    marchio {marchio ? <strong>{marchio}</strong> : ''}, puoi usare la mappa per localizzare gli
                    impianti, filtrare per <strong>{carburante}</strong> e ordinare per prezzo.
                </p>
                <p>
                    Che tu stia
                    pianificando un viaggio o semplicemente voglia ottimizzare il tuo tragitto quotidiano, questo
                    strumento ti aiuta a fare scelte consapevoli e convenienti.
                </p>
                <p>
                    Scopri come risparmiare sul tuo prossimo
                    pieno di <strong>{carburante}</strong> {marchio ? <strong>{marchio}</strong> : ''} {localita} e
                    rendi il tuo rifornimento più intelligente.
                </p></>)}
        </section>
    );
}

export function IntroText({ data, children }) {

    console.log(data);

    const { request, carburanti, marchi = [], comuni = [], regione, totaleImpianti, dataAggiornamento } = data;

    const scope = request.comune
        ? { livello: 'comune', valore: request.comune }
        : request.provincia
            ? { livello: 'provincia', valore: request.provincia }
            : { livello: 'regione', valore: request.regione || regione };

    const carburante = request.carburante.toLowerCase();
    const carburanteLabel = capitalize(carburante);
    const stats = carburanti[carburanteLabel] || {};
    const marchio = request.marchio ? request.marchio.toUpperCase() : null;
    const dataFormatted = formatDate(dataAggiornamento);

    const topMarchi = [...marchi].sort((a, b) => b.impianti - a.impianti).slice(0, 5);
    const topComuni = [...comuni].sort((a, b) => b.impianti - a.impianti).slice(0, 5);

    const localita = scope.livello === 'comune'
        ? `a ${capitalize(scope.valore)}`
        : scope.livello === 'provincia'
            ? `in provincia di ${capitalize(scope.valore)}`
            : `in ${capitalize(scope.valore)}`;

    const marchioImpianti = marchio
        ? marchi.find(m => m.marchio.toUpperCase() === marchio)?.impianti
        : null;

    return (
        <section className="intro-text">
            <h1>Prezzi {carburanteLabel} {marchio ? marchio : ''} {localita}</h1>

            <h2>Mappa carburanti {carburanteLabel} {marchio ? marchio : ''} {localita}</h2>
            <p className={'lead text-muted'}>
                Stai cercando i <strong>prezzi della {carburanteLabel} {marchio ? marchio + ' ' : ''}{localita}</strong>? La mappa interattiva ti mostra in tempo reale tutti gli impianti di distribuzione carburante attivi.</p>
            {children}
            <p>
                Grazie a questo strumento, puoi confrontare facilmente i distributori di {carburante} {marchio ? `del marchio ${marchio}` : ''} {localita}, individuare le offerte più convenienti e pianificare il tuo rifornimento in modo intelligente.
            </p>

            <h2>Prezzi {carburanteLabel} {marchio ? marchio : ''} {localita}: medie e variazioni</h2>
            <p>
                Il prezzo medio della <strong>{carburanteLabel}</strong> {localita} è di <strong>{formatEuro(stats.media)}</strong>, con un minimo di <strong>{formatEuro(stats.min)}</strong> e un massimo di <strong>{formatEuro(stats.max)}</strong>. Se stai cercando la {carburante} {marchio}, è utile confrontare questi valori per scegliere il distributore più conveniente. Le variazioni dipendono da posizione, concorrenza e promozioni attive.
            </p>

            <h2>Distribuzione degli impianti {carburanteLabel} {marchio ? marchio : ''} {localita}</h2>
            <p>
                Nella {scope.livello} di <strong>{capitalize(scope.valore)}</strong> sono attivi <strong>{totaleImpianti || 'numerosi'}</strong> impianti. Il marchio <strong>{marchio}</strong> è ben rappresentato {marchioImpianti ? `con ${marchioImpianti} impianti censiti` : 'nella zona'}, offrendo una rete capillare e affidabile per chi cerca {carburante} {marchio}. La concorrenza tra marchi come {topMarchi.map(m => m.marchio).join(', ')} favorisce la trasparenza e la scelta.
            </p>

            <h2>Perché scegliere {carburanteLabel} {marchio} {localita}</h2>
            <p>
                Il marchio <strong>{marchio}</strong> è noto per la qualità del servizio e la presenza capillare {localita}. Se sei fedele a {marchio}, puoi usare la mappa per localizzare gli impianti, confrontare i prezzi e verificare eventuali promozioni. Molti impianti {marchio} offrono sconti, programmi fedeltà e servizi aggiuntivi che rendono il rifornimento più conveniente.
            </p>

            <h2>Come trovare il miglior prezzo {carburanteLabel} {marchio ? marchio : ''} {localita}</h2>
            <p>
                Usa la mappa per filtrare per carburante e marchio, ordinare per prezzo e visualizzare i dettagli di ogni impianto. Se stai pianificando un viaggio o vuoi ottimizzare il tuo tragitto quotidiano, la mappa ti permette di individuare i distributori {marchio} più convenienti lungo il percorso.
            </p>

            <h2>Dati aggiornati {carburanteLabel} {marchio ? marchio : ''} {localita}</h2>
            <p>
                I dati sono aggiornati al <strong>{dataFormatted}</strong>, garantendo affidabilità e trasparenza. Che tu sia un utente occasionale o abituale, la mappa ti aiuta a monitorare i prezzi della <strong>{carburanteLabel} {marchio}</strong> {localita} e a fare scelte consapevoli in un mercato in continua evoluzione.
            </p>
        </section>
    );
}
