import {capitalize} from "@/functions/helpers";

export default function SezioneTitolo({ regione, carburante, provincia, comune, marchio }) {
    const descrizioneCarburante = carburante ? carburante.toLowerCase() : 'carburante';

    const localizzazione = comune
        ? `${capitalize(comune)}, ${provincia?.toUpperCase()}`
        : provincia
            ? `provincia di ${provincia.toUpperCase()}`
            : capitalize(regione);

    const titolo = `Prezzi ${descrizioneCarburante} in ${localizzazione}`;

    function DescrizioneLead() {
        let descrizione = 'per benzina, diesel, GPL e metano';
        if (carburante) descrizione = `per ${descrizioneCarburante}`;
        if (marchio) descrizione += ` del marchio ${marchio}`;

        return (
            <p className="lead text-muted mb-4">
                Scopri i distributori attivi in <strong>{localizzazione}</strong> con prezzi aggiornati {descrizione}.
                Puoi navigare per città, tipo di carburante o marchio.
            </p>
        );
    }

    return (
        <>
            <h1 className="mb-4">{titolo}</h1>
            <DescrizioneLead />
        </>
    );
}
