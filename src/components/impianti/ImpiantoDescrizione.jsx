export default function ImpiantoDescrizione({impianto}) {
    if (!impianto) return null;

    const {
        nome_impianto,
        gestore,
        bandiera,
        tipo_impianto,
        indirizzo,
        comune,
        provincia,
        prezzo,
        latitudine,
        longitudine,
    } = impianto;

    const prezzoStr = prezzo?.toFixed(3) ?? '—';
    const localita = `${comune} (${provincia})`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitudine},${longitudine}`;

    return (
        <section className="mt-4">
            <h2 className="h5">Descrizione dell'impianto</h2>
            <p>
                Il distributore <strong>{nome_impianto}</strong>, gestito da <strong>{gestore}</strong>, si trova
                in <strong>{indirizzo}</strong> a <strong>{localita}</strong>. Si tratta di un
                impianto <strong>{tipo_impianto}</strong> con bandiera <strong>{bandiera}</strong>, facilmente
                raggiungibile per chi transita nella zona.
            </p>
            {impianto.prezzo !== 0 ?
            <p>
                Il prezzo attuale del carburante è di <strong>{prezzoStr} €/L</strong>, aggiornato in tempo reale.
                Questo lo rende una scelta interessante per chi cerca convenienza e trasparenza.
            </p> : null}
            <p>
                Puoi <a href="#mappa">visualizzare la posizione sulla mappa</a>, <a href={mapsUrl} target="_blank"
                                                                                    rel="noopener">avviare la
                navigazione</a>, oppure <a href="#confronta">confrontare i prezzi con altri impianti vicini</a>.
            </p>
            <p>
                PrezziBenzina.eu ti aiuta a pianificare il rifornimento in modo intelligente, con dati sempre aggiornati
                e strumenti utili per risparmiare.
            </p>
        </section>
    );
}
