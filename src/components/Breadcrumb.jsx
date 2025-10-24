import {capitalize, ucwords} from "@/functions/helpers";
import {getElencoStati} from "@/functions/api";

export default function Breadcrumb({stato, regione, carburante, provincia, comune, marchio, riepilogo = {}, impianto}) {

    const getPath = () => {
        const path = [];
        path.push({label: 'Home', link: '/'});


        if (stato) {

            const stati = getElencoStati();

            const recordStato = stati.find(function (item) {
                return item.id === stato.toLowerCase();
            });

            path.push({
                label: ucwords(recordStato.name),
                link: `/mappa/?lat=${recordStato.lat}&lng=${recordStato.lng}&zoom=${recordStato.zoom}`,
            });
        }

        if (regione) {

            const nomeRegione = regione.replace("-", " ");

            path.push({
                label: ucwords(nomeRegione),
                link: `/${regione}/${carburante}`,
            });

            if (riepilogo.marchio && !provincia) {
                path.push({
                    label: capitalize(riepilogo.marchio.nome),
                    link: `/${regione}/${carburante}/marchio/${riepilogo.marchio.id}`,
                });
            }

        }

        if (provincia) {
            path.push({
                label: provincia.toUpperCase(),
                link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}`,
            });

            if (riepilogo.marchio && !comune) {
                path.push({
                    label: capitalize(riepilogo.marchio.nome),
                    link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/marchio/${riepilogo.marchio.id}`,
                });
            }
        }
        if (comune) {
            path.push({
                label: ucwords(comune.description),
                link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/${comune.id}`,
            });

            if (riepilogo.marchio) {
                path.push({
                    label: capitalize(riepilogo.marchio.nome),
                    link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/${comune.id}/marchio/${riepilogo.marchio.id}`,
                });
            }
        }


        if (impianto) {
            path.push({
                label: capitalize(impianto.nome_impianto),
                link: `/impianto/${impianto.link}`,
            });
            return path;
        }


        return path;

    }


    const path = getPath();



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
