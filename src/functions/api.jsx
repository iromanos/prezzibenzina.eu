import axios from "axios";
import {NextResponse} from "next/server";

const URI = process.env.NEXT_PUBLIC_API_ENDPOINT + '/pb/';


export async function getSiteMap({tipo, regione, provincia}) {


    let request = URI + 'sitemap/' + tipo;

    if (regione) {
        request += "?regione=" + regione;

        if (provincia) {
            request += "&provincia=" + provincia;
        }
    }

    log(tipo);
    log(regione);
    log(request);

    const res = await fetch(request);

    const xml = await res.text();


    return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
            }
        }
    );
}

export async function getDistributoriRegione(regione, carburante, marchio, provincia, comune) {

    let fuel = '';
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';

    let request = URI + "prezzi/r/" + regione + "/" + fuel;

    if (provincia) {
        request = URI + "prezzi/p/" + provincia + "/" + fuel;
    }

    if (comune) {
        request = URI + "prezzi/c/" + comune + "/" + fuel;
    }

    if (marchio) {
        request += "?marchio=" + marchio;
    }
    log(request);

    const res = await fetch(request, {
        headers: {
            Accept: 'application/json',
        },
        next: {revalidate: 3600},
    });

    const data = await res.json();

    log(data);

    return data;
}
export async function getSeoRegione(regione, carburante, marchio, provincia, comune) {

    let fuel = null;
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';


    let request = URI + `seo/regione/${regione}?`;

    if (fuel) {
        request += `fuel=${fuel}&`;
    }

    if (provincia) {
        request += `provincia=${provincia}&`;
    }

    if (comune) {
        request += `comune=${comune}&`;
    }

    if(marchio) {
        request += `marchio=${marchio}&`;
    }
    log(request);

    const res = await axios.get(request);

    // console.log(res.data);

    return res.data;

}

export function getRouteLink(regione, carburante, marchio, provincia, comune) {
    const path = [];
    // const title
    const scope = comune
        ? {livello: 'comune', valore: comune}
        : provincia
            ? {livello: 'provincia', valore: provincia}
            : {livello: 'regione', valore: regione || regione};

    const localita =
        scope.livello === 'comune'
            ? `a ${capitalize(scope.valore)}`
            : scope.livello === 'provincia'
                ? `in provincia di ${capitalize(scope.valore)}`
                : `in ${capitalize(scope.valore)}`;

    let title = "Prezzi " + carburante;
    if (marchio && marchio !== "Tutti") {
        title += " " + marchio;
    }
    title += " " + localita;

    if (regione) {
        path.push(`/${regione}/${carburante}`);
    }

    if (provincia) {
        path.push(`/provincia/${provincia}`);
    }

    if (comune) {
        path.push(`/${comune}`);
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
            label: capitalize(comune),
            link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/${comune}`,
        });
    }

    if (marchio) {
        path.push({
            label: capitalize(marchio),
            link: `/${regione}/${carburante}/provincia/${provincia}/${comune}/marchio/${marchio}`,
        });
    }
    return path[path.length - 1];
}

export async function getMetadata({params}) {
    const {regione, carburante, marchio, sigla, comune} = await params;

    const distributori = await getDistributoriRegione(regione, carburante, marchio, sigla, comune);

    const descrizioneCarburante = carburante ? carburante.toLowerCase() : 'carburante';

    const localizzazione = comune
        ? `${capitalize(comune)}, ${sigla?.toUpperCase()}`
        : sigla
            ? `provincia di ${sigla.toUpperCase()}`
            : capitalize(regione);

    const titolo = `Prezzi ${descrizioneCarburante} in ${localizzazione} | Distributori attivi`;
    const descrizione = `Consulta i prezzi aggiornati dei ${carburante} in ${localizzazione}. Trova i distributori più convenienti e naviga per città e tipo di carburante.`;

    const canonicalUrl = getLink(regione, carburante, null, sigla, comune);
    const imageUrl = '/assets/logo.png';

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


export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-') // sostituisce spazi e simboli con -
}


export function generateMicrodataGraph(impianti) {
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