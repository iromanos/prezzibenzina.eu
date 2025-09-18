import {capitalize} from "@/functions/helpers";

export default function Breadcrumb({regione, carburante, provincia, comune, marchio, riepilogo}) {
    const path = [];

    // Helper per capitalizzare


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
            link: `/${regione}/${carburante}/provincia/${provincia}`,
        });
    }

    if (comune) {
        path.push({
            label: capitalize(comune),
            link: `/${regione}/${carburante}/provincia/${provincia}/${comune}`,
        });
    }

    if (riepilogo.marchio) {
        path.push({
            label: capitalize(riepilogo.marchio.nome),
            link: `/${regione}/${carburante}/provincia/${provincia}/${comune}/marchio/${riepilogo.marchio.id}`,
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
