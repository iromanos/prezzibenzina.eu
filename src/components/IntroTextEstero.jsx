import {capitalize, formatDate, logDebug, ucwords} from "@/functions/helpers";
import React from "react";

export function IntroTextEstero({data, distributori, children}) {

    logDebug(data);
    logDebug(distributori);

    const {request, carburanti, marchi = [], comuni = [], regione, totaleImpianti, dataAggiornamento} = data;
    const scope = request.regione
        ? {livello: 'regione', valore: request.regione}
        : {livello: 'stato', valore: request.stato};

    const carburante = request.carburante.toLowerCase();
    const carburanteLabel = capitalize(carburante);

    // const stats = carburanti[carburante] || {};

    const marchio = data.marchio ? data.marchio.nome : null;
    const dataFormatted = formatDate(dataAggiornamento);


    const localita =
        scope.livello === 'comune'
            ? `a ${ucwords(scope.valore)}`
            : scope.livello === 'provincia'
                ? `in provincia di ${scope.valore.toUpperCase()}`
                : `in ${ucwords(scope.valore)}`;


    const marchioImpianti = marchio ? marchi.find(m => m.marchio.toUpperCase() === marchio)?.impianti : null;

    const noResults = distributori.length === 0;

    return (
        <section className="intro-text">

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
                    I dati sono aggiornati
                    al <strong>{dataFormatted}</strong>, garantendo trasparenza e affidabilità.
                </p>
                <p>
                    <strong>{ucwords(localita)}</strong> sono
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
