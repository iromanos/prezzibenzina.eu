import Link from 'next/link';
import MappaWrapper from "@/components/MappaWrapper";
import axios from "axios";

const URI = "http://localhost:8080/api/prezzi/r/"

// ✅ Fetch lato server
async function getDistributoriRegione(regione) {


    const res = await axios.get(URI + regione);

    console.log(res.data);

    return res.data;
}


export async function generateMetadata({params}) {
    const {regione} = params;
    const Regione = regione.charAt(0).toUpperCase() + regione.slice(1);

    return {
        title: `Prezzi carburante in ${Regione} | Distributori attivi`,
        description: `Consulta i prezzi aggiornati dei carburanti in ${Regione}. Trova i distributori più convenienti e naviga per città e tipo di carburante.`,
        keywords: [`prezzi carburante ${regione}`, `distributori ${regione}`, `benzina ${regione}`, `diesel ${regione}`],
    };
}

export default async function RegionePage({params}) {
    const {regione} = params;
    const Regione = decodeURIComponent(regione.charAt(0).toUpperCase() + regione.slice(1));

    // ✅ Fetch lato server
    const distributori = await getDistributoriRegione(regione);


    const comuni = [...new Set(distributori.map((d) => d.comune))].slice(0, 10);
    const carburanti = ['benzina', 'diesel', 'gpl', 'metano'];

    return (
        <div className="container py-5">
            <h1 className="mb-4">Prezzi carburante in {Regione}</h1>
            <p>
                Scopri i distributori attivi in <strong>{Regione}</strong> con prezzi aggiornati per benzina, diesel,
                GPL e metano. Puoi navigare per città o tipo di carburante.
            </p>

            {/* 🔗 Link ai comuni */}
            <section className="mb-4">
                <h2 className="h5 mb-3">Città principali</h2>
                <div className="d-flex flex-wrap gap-2">
                    {comuni.map((comune) => (
                        <Link
                            key={comune}
                            href={`/prezzi/${regione}/carburante/benzina/${comune.toLowerCase()}`}
                            className="btn btn-outline-secondary btn-sm"
                        >
                            {comune.charAt(0).toUpperCase() + comune.slice(1)}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mt-5">
                <h2 className="h4 mb-3">Prezzi carburante in Lombardia: trova il distributore più conveniente</h2>
                <p>
                    La Lombardia è una delle regioni italiane con il maggior numero di distributori di carburante,
                    distribuiti capillarmente tra grandi città come Milano, Bergamo, Brescia e Como, e centri più
                    piccoli. Grazie a questa pagina puoi consultare in tempo reale i <strong>prezzi della benzina, del
                    diesel, del GPL e del metano</strong> in tutta la regione, confrontando le tariffe praticate dai
                    diversi impianti.
                </p>
                <p>
                    I dati sono aggiornati quotidianamente e provengono da fonti ufficiali come il Ministero delle
                    Imprese e del Made in Italy. Questo ti permette di effettuare rifornimenti consapevoli, evitando le
                    stazioni con prezzi sopra la media e scegliendo quelle più convenienti vicino a te.
                </p>
                <p>
                    In Lombardia, il <strong>prezzo medio della benzina</strong> si attesta attorno a <em>1,697 €/L</em>,
                    mentre il <strong>diesel</strong> si aggira sui <em>1,631 €/L</em>. Il <strong>GPL</strong> è
                    disponibile a circa <em>0,668 €/L</em> e il <strong>metano</strong> a <em>1,402 €/kg</em>. Tuttavia,
                    questi valori possono variare sensibilmente tra una provincia e l’altra, e persino tra distributori
                    della stessa città.
                </p>
                <p>
                    Utilizzando la <strong>mappa interattiva</strong> e i filtri disponibili, puoi visualizzare i
                    distributori attivi per ogni tipo di carburante, ordinati per prezzo, distanza o marchio. Che tu
                    stia cercando un impianto self-service economico o un servizio completo, qui troverai tutte le
                    informazioni necessarie per scegliere al meglio.
                </p>
                <p>
                    Tra le province più servite troviamo <strong>Milano</strong> con oltre 750 impianti, seguita
                    da <strong>Brescia</strong>, <strong>Bergamo</strong> e <strong>Varese</strong>. Ogni comune ha le
                    sue peculiarità: alcuni offrono carburanti alternativi come HVO o GNL, altri si distinguono per
                    promozioni temporanee o sconti fedeltà.
                </p>
                <p>
                    Se vuoi approfondire la situazione in una città specifica, puoi navigare tra le pagine dedicate
                    come <Link href="/prezzi/lombardia/carburante/benzina/milano">Milano</Link>, <Link
                    href="/prezzi/lombardia/carburante/diesel/bergamo">Bergamo</Link> o <Link
                    href="/prezzi/lombardia/carburante/gpl/brescia">Brescia</Link>. Ogni pagina mostra i distributori
                    attivi, i prezzi aggiornati e la mappa geolocalizzata.
                </p>
                <p>
                    Risparmiare sul carburante è possibile: basta confrontare, scegliere e rifornirsi con intelligenza.
                    Inizia ora la tua ricerca e trova il miglior prezzo in Lombardia.
                </p>
            </section>


            <section className="mb-5">
                <h2 className="h5 mb-3">Mappa dei distributori</h2>
                <MappaWrapper distributori={distributori}/>
            </section>

            {/* ✅ Elenco SEO lato server */}
            <section>
                <h2 className="h5 mb-3">Distributori attivi in {Regione}</h2>
                {distributori.length === 0 ? (
                    <p className="text-muted">Nessun distributore trovato nella regione.</p>
                ) : (
                    <ul className="list-group">
                        {distributori.map((d) => (
                            <li key={d.id_impianto}
                                className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{d.bandiera}</strong> — {d.nome_impianto}
                                    <div className="text-muted small">
                                        {d.indirizzo}, {d.comune} ({d.provincia})
                                    </div>
                                </div>
                                <span className="badge bg-success">{d.prezzo.toFixed(3)} €/L</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
