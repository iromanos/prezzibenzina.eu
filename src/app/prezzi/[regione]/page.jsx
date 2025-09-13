import Link from 'next/link';
import MappaWrapper from "@/components/MappaWrapper";
import axios from "axios";
import Header from "@/components/Header";
import SeoTextRegione from "@/components/SeoTextRegione";

const URI = "http://localhost:8080/pb/"

// ✅ Fetch lato server
async function getDistributoriRegione(regione, carburante, marchioSelezionato) {

    let fuel = '';
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';

    let request = URI + "prezzi/r/" + regione + "/" + fuel;
    if (marchioSelezionato != null) {
        request += "?marchio=" + marchioSelezionato;
    }

    const res = await axios.get(request);

    console.log(res.data);

    return res.data;
}


async function getSeoRegione(regione, carburante) {

    let fuel = '';
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';

    const res = await axios.get(URI + "seo/regione/" + regione + "/" + fuel);

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

function FiltroMarchio({regione, marchi, selezionato, carburante}) {
    return (
        <section className="mb-4">
            <h2 className="h5 mb-3">Filtra per marchio</h2>
            <div className="btn-group flex-wrap" role="group">
                {marchi.map((marchio) => (
                    <Link
                        key={marchio}
                        href={`/prezzi/${regione}/carburante/${carburante}?marchio=${encodeURIComponent(marchio)}`}
                        className={`btn btn-sm ${selezionato === marchio ? 'btn-primary' : 'btn-outline-primary'}`}
                    >
                        {marchio}
                    </Link>
                ))}
            </div>
        </section>
    );
}

function SezioneComuni({regione, comuni}) {
    return <>
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
    </section></>;
}

function FiltroCarburante({regione, carburanti, selezionato}){
    return                 <section className="mb-4">
        <h2 className="h5 mb-3">Filtra per tipo di carburante</h2>
        <div className="btn-group" role="group">
            {carburanti.map((tipo) => (
                <Link
                    key={tipo}
                    href={`/prezzi/${regione}/carburante/${tipo.toLowerCase()}`}
                    className={`btn btn-sm ${ selezionato === tipo ? 'btn-primary' : 'btn-outline-primary' } `}
                >
                    {tipo}
                </Link>
            ))}
        </div>
    </section>;

}

function Mappa({distributori}){
    return <section className={"mb-4"}>
        <h2 className="h5 mb-3">Mappa dei distributori</h2>
        <MappaWrapper distributori={distributori}/>
    </section>;

}

function ElencoDistributori({Regione, distributori}){
    return                 <section className={'mb-4'}>
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
    </section>;

}

function SezioneTitolo({Regione, carburante}){
    const descrizioneCarburante = carburante ? carburante : "carburante";

    function DescrizioneLead(){

        let descrizione = "per benzina, diesel, GPL e metano";

        if (carburante) {
            descrizione = "per " + descrizioneCarburante;
        }

        return <p className={'lead text-muted mb-4'}>
            Scopri i distributori attivi in <strong>{Regione}</strong> con prezzi aggiornati {descrizione}. Puoi navigare per città o tipo di carburante.
        </p>
    }

    return <>
    <h1 className="mb-4">Prezzi {descrizioneCarburante} in {Regione}</h1>
        <DescrizioneLead />
</>;

}

export default async function RegionePage({params, searchParams}) {
    const {regione, carburante} = params;
    const marchioSelezionato = searchParams?.marchio || null;

    const Regione = decodeURIComponent(regione.charAt(0).toUpperCase() + regione.slice(1));

    const distributori = await getDistributoriRegione(regione, carburante, marchioSelezionato);
    const riepilogo = await getSeoRegione(regione, carburante);

    const comuni = [...new Set(riepilogo.comuni.map((d) => d.nome))];
    const carburanti = ['benzina', 'diesel', 'gpl', 'metano'];

    const marchi = [...new Set(riepilogo.marchi.map((d) => d.marchio))].filter(Boolean);

    return (<>
            <Header/>
            <div className="container py-5">

                <SezioneTitolo Regione={Regione} carburante={carburante} />

                <SezioneComuni comuni={comuni} regione={regione} />

                <SeoTextRegione data={riepilogo}/>


                <div className={'row'}>
                    <div className={'col-md-5'}>
                        <ElencoDistributori Regione={Regione} distributori={distributori} />
                    </div>
                    <div className={'col-md-7'}>
                        <FiltroCarburante regione={regione} carburanti={carburanti} selezionato={carburante} />
                        <FiltroMarchio regione={regione} carburante={carburante} marchi={marchi} selezionato={marchioSelezionato} />
                <Mappa distributori={distributori} /></div>
                </div>

            </div>
        </>
    );
}
