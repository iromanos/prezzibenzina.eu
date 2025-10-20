import {getCarburanti, getDistributoriRegione, getMarchi, getSeoRegione} from "@/functions/api";
import {notFound} from "next/navigation";


export function getRouteLink(regione, carburante, marchio, provincia, comune) {
    const path = [];
    // const title
    const scope = comune
        ? {livello: 'comune', valore: comune.description.toLowerCase()}
        : provincia
            ? {livello: 'provincia', valore: provincia}
            : {livello: 'regione', valore: regione || regione};

    const localita =
        scope.livello === 'comune'
            ? `a ${ucwords(scope.valore)}`
            : scope.livello === 'provincia'
                ? `in provincia di ${ucwords(scope.valore)}`
                : `in ${ucwords(scope.valore)}`;

    let title = "Prezzi " + carburante;
    if (marchio && marchio !== "Tutti") {
        title += " " + marchio;
    }
    title += " " + localita;

    if (regione) {
        path.push(`/${regione}/${carburante.toLowerCase()}`);
    }

    if (provincia) {
        path.push(`/provincia/${provincia}`);
    }

    if (comune) {
        if (!provincia) path.push(`/provincia/${comune.provincia.toLowerCase()}`);
        path.push(`/${comune.id}`);
    }

    if (marchio && marchio !== "Tutti") {
        path.push(`/marchio/${slugify(marchio)}`);
    }

    return {
        'title': title,
        'link': path.join("")
    }

}

export function getLink(regione, carburante, marchio, provincia, comune) {
    const path = [];

    path.push({label: 'Home', link: '/'});

    if (regione) {
        path.push({
            label: ucwords(regione),
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

    if (marchio) {
        if (comune) {
            path.push({
                label: capitalize(marchio),
                link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/${comune.id}/marchio/${marchio}`,
            });
        } else if (provincia) {
            path.push({
                label: provincia.toUpperCase(),
                link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/marchio/${marchio}`,
            });
        } else {
            path.push({
                label: '',
                link: `/${regione}/${carburante}/marchio/${marchio}`,
            });
        }
    }
    return path[path.length - 1];
}

export async function getMetadata({params}) {
    const {regione, carburante, marchio, sigla, comune} = await params;

    const carburanti = getCarburanti();
    const elencoMarchi = await getMarchi();

    if (carburanti[carburante] === undefined) {
        notFound();
    }

    if (marchio !== undefined) {
        if (elencoMarchi.filter(m => m.id === marchio).length === 0) {
            notFound();
        }
    }

    const response = await getDistributoriRegione(regione, carburante, marchio, sigla, comune);
    const riepilogo = await getSeoRegione(regione, carburante, marchio, sigla, comune);

    const distributori = await response.json();

    const descrizioneCarburante = carburante ? carburante.toLowerCase() : 'carburante';

    const localizzazione = comune
        ? `a ${ucwords(riepilogo.request.comune.description)}, ${sigla?.toUpperCase()}`
        : sigla
            ? `provincia di ${sigla.toUpperCase()}`
            : ucwords(regione);

    const titolo = `Prezzi ${descrizioneCarburante} ${localizzazione} | Distributori attivi`;
    const descrizione = `Consulta i prezzi aggiornati dei ${carburante} ${localizzazione}. Trova i distributori più convenienti e naviga per città e tipo di carburante.`;

    const canonicalUrl = getLink(regione, carburante, marchio, sigla, riepilogo.request.comune);
    const imageUrl = '/assets/logo.png';

    log("CANONICAL URL: " + canonicalUrl.link);

    const microdata = generateMicrodataGraph(distributori);

    return {
        other: {
            'application/ld+json': JSON.stringify(microdata),
        },
        title: titolo,
        description: descrizione,
        alternates: {
            canonical: canonicalUrl.link,
        },
        openGraph: {
            titolo,
            descrizione,
            url: canonicalUrl.link,
            siteName: 'PrezziBenzina.eu',

            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: titolo,
                },
            ],
            locale: 'it_IT',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            titolo,
            descrizione,
            images: [imageUrl],
        },
    };

}

export const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const ucwords = (str) => {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-') // sostituisce spazi e simboli con -
}

export function generateMicrodataGraph(impianti) {

    log(impianti);
    const graph = impianti.map((impianto) => {
        const {
            nome_impianto,
            gestore,
            bandiera,
            indirizzo,
            comune,
            provincia,
            latitudine,
            longitudine,
            prezzoMinimo,
            impianto_scheda,
            link,
        } = impianto

        return {
            '@type': 'FuelStation',
            '@id': `https://www.prezzibenzina.eu/impianto/${link}`,
            name: nome_impianto || impianto_scheda?.name || gestore,
            brand: bandiera,
            address: {
                '@type': 'PostalAddress',
                streetAddress: indirizzo,
                addressLocality: comune,
                addressRegion: provincia,
                addressCountry: 'IT',
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: latitudine,
                longitude: longitudine,
            },
            priceRange: prezzoMinimo ? `€${prezzoMinimo.toFixed(3)}/L` : undefined,
            telephone: impianto_scheda?.phone_number || undefined,
            url: `https://www.prezzibenzina.eu/impianto/${link}`,
        }
    })

    return {
        '@context': 'https://schema.org',
        '@graph': graph,
    }
}

export function log(message) {
    if (process.env.NODE_ENV === 'development') {
        console.log(message);
    }
}