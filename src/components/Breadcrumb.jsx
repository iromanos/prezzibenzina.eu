import {capitalize, ucwords} from "@/functions/helpers";

export default function Breadcrumb({regione, carburante, provincia, comune, marchio, riepilogo = {}, impianto}) {
    const path = [];

    path.push({ label: 'Home', link: '/' });

    if (regione) {
        path.push({
            label: capitalize(regione),
            link: `/${regione}/${carburante}`,
        });
    }

    if (provincia) {
        path.push({
            label: provincia.toUpperCase(),
            link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}`,
        });
    }

    if (comune) {
        path.push({
            label: ucwords(comune.description),
            link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/${comune.id}`,
        });
    }

    if (riepilogo.marchio) {
        path.push({
            label: capitalize(riepilogo.marchio.nome),
            link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/${comune.id}/marchio/${riepilogo.marchio.id}`,
        });
    }

    if (impianto) {
        path.push({
            label: capitalize(impianto.nome_impianto),
            link: `/impianto/${impianto.link}`,
        });
    }

    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                {path.map((p, index) => {
                    const isLast = index === path.length - 1;
                    return (
                        <li key={p.label} className="breadcrumb-item">
                            {isLast ? (
                                <span>{p.label}</span>
                            ) : (
                                <a href={p.link}>{p.label}</a>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
