import {ucwords} from "@/functions/helpers";

export default function ImpiantoDescrizione({impianto, carburante}) {
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
    const localita = `${ucwords(comune)} (${provincia})`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitudine},${longitudine}`;

    const testoCarburante = carburante === 'benzina' ? <>della <strong>benzina</strong></> : <>del <strong>{carburante}</strong></>;

    return (
        <section className="mt-4">
            <h2 className="h5">Descrizione dell'impianto</h2>
            <p>
                Il
                distributore <strong>{nome_impianto}</strong>{gestore ? <>, gestito
                da <strong>{gestore}</strong></> : null},
                si trova
                in <strong>{indirizzo}</strong>{comune !== '' ? <> a <strong>{localita}</strong></> : null}. Si tratta
                di
                un
                impianto <strong>{tipo_impianto.toLowerCase()}</strong> con bandiera <strong>{bandiera}</strong>,
                facilmente
                raggiungibile per chi transita nella zona.
            </p>
            {impianto.prezzo !== 0 ?
            <p>
                Il prezzo attuale {testoCarburante} è di <strong>{prezzoStr} €/L</strong>, aggiornato in tempo reale.
                Questo lo rende una scelta interessante per chi cerca convenienza e trasparenza.
            </p> : null}
            <p>
                Puoi <a href="#mappa">visualizzare la posizione sulla mappa</a>, <a href={mapsUrl} target="_blank"
                                                                                    rel="noopener">avviare la
                navigazione</a>.
            </p>
        </section>
    );
}
