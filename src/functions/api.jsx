import axios from "axios";

const URI = process.env.NEXT_PUBLIC_API_ENDPOINT + '/pb/';
// ✅ Fetch lato server
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
    console.log(request);

    const res = await axios.get(request);


    return res.data;
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
    console.log(request);

    const res = await axios.get(request);

    // console.log(res.data);

    return res.data;

}

export function getRouteLink(regione, carburante, marchio, provincia, comune) {
    const path = [];

    if (regione) {
        path.push(`/${regione}/${carburante}`);
    }

    if (provincia) {
        path.push(`/provincia/${provincia}`);
    }

    if (comune) {
        path.push(`/${comune}`);
    }

    if (marchio) {
        path.push(`/marchio/${marchio}`);
    }

    return path.join("");

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
    const {regione, carburante, comune, sigla} = await params;

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

    return {
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