import {getCarburanti, getImpiantiByDistance, getMarchi, getSeoRegione} from "@/functions/api";
import {notFound} from "next/navigation";
import slugify from 'slugify';


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

    const descrizioneCarburante = carburante ? carburante === 'benzina' ? ` della ${carburante}` : ` del ${carburante}` : ' del carburante';


    let title = "Prezzo" + descrizioneCarburante;
    if (marchio && marchio !== "Tutti") {
        title += " " + marchio;
    }
    title += " " + localita;

    if (regione) {
        if (!comune || (comune && comune.link === '')) {
            path.push(`/${regione}/${carburante.toLowerCase()}`);
        }
    }

    if (provincia) {
        if (!comune || (comune && comune.link === '')) {
            path.push(`/provincia/${provincia}`);
        }
    }

    if (comune) {
        if (comune.link === '') {
            if (!provincia) path.push(`/provincia/${comune.provincia.toLowerCase()}`);
            path.push(`/${comune.id}`);
        } else {
            path.push(`${comune.link}`);
            path.push(`/prezzo-${carburante.toLowerCase()}`);
        }
    }

    if (marchio && marchio !== "Tutti") {
        if (!comune || (comune && comune.link === '')) {
            path.push(`/marchio/${slugify(marchio.toLowerCase())}`);
        } else {
            path.push('-' + slugify(marchio.toLowerCase()));
        }
    }

    return {
        'title': title,
        'link': path.join("")
    }

}

export function getCanonicalUrl(regione, carburante, marchio, provincia, comune, servizio) {
    const path = [];

    path.push({label: 'Home', link: '/'});

    if (regione) {
        if (!comune || (comune && comune.link === '')) {
            path.push({
                label: ucwords(regione),
                link: `/${regione}/${carburante}`,
            });
        }
    }

    if (provincia) {
        if (!comune || (comune && comune.link === '')) {
            path.push({
                label: provincia.toUpperCase(),
                link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}`,
            });
        }
    }

    if (comune) {
        if (comune.link === '') {
            path.push({
                label: ucwords(comune.description),
                link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/${comune.id}`,
            });
        } else {
            path.push({
                label: ucwords(comune.description),
                link: comune.link + '/prezzo-' + carburante,
            });
        }
    }

    if (marchio) {
        if (comune) {
            if (comune.link === '') {
                path.push({
                    label: capitalize(marchio),
                    link: `/${regione}/${carburante}/provincia/${provincia.toLowerCase()}/${comune.id}/marchio/${marchio}`,
                });
            } else {
                path.push({
                    label: capitalize(marchio),
                    link: comune.link + '/prezzo-' + carburante + '-' + marchio,
                });
            }
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

    if (servizio) {
        if (comune && comune.link !== '') {
            path.push({
                label: capitalize(servizio.description),
                link: comune.link + '/prezzo-' + carburante + '-' + marchio + '-' + servizio.slug,
            });
        }
    }

    return path[path.length - 1];
}

export async function getMetadataEstero({params}) {
    const {carburante} = await params;
    const carburanti = getCarburanti();

    if (carburanti[carburante] === undefined) {
        notFound();
    }

    const stato = params.stato;

    const response = await getImpiantiByDistance({stato: stato, carburante: carburante, limit: 25});

    const distributori = await response.json();
    const descrizioneCarburante = carburante ? ucwords(carburante) : 'carburante';

    const localizzazione = ' in ' + ucwords(stato);

    const titolo = `Prezzi ${descrizioneCarburante} ${localizzazione} | Distributori attivi`;
    const descrizione = `Consulta i prezzi aggiornati di ${carburante} ${localizzazione}. 
                Trova i distributori più convenienti e naviga per città e tipo di carburante.`;

    const canonicalUrl = {
        'link': stato + '/' + carburante
    };
    const imageUrl = '/assets/logo.png';

    logDebug("CANONICAL URL: " + canonicalUrl.link);

    // const microdata = generateMicrodataGraph(distributori);

    return {
        title: titolo,
        description: descrizione,
        alternates: {
            canonical: canonicalUrl.link,
            languages: {
                'it': canonicalUrl.link,
                'x-default': canonicalUrl.link,
            },
        },
        openGraph: {
            title: titolo,
            description: descrizione,
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
            title: titolo,
            description: descrizione,
            images: [imageUrl],
        },
    };


}

export async function getMetadata({params}) {
    const {regione, carburante, marchio, sigla, comune, servizio} = await params;

    const carburanti = getCarburanti();
    const elencoMarchi = await getMarchi();

    if (carburanti[carburante] === undefined) {
        notFound();
    }

    if (marchio !== undefined && marchio !== null) {
        if (elencoMarchi.filter(m => m.id === marchio).length === 0) {
            notFound();
        }
    }

    const [resSeoRegione] = await Promise.all(
        [
            getSeoRegione(regione, carburante, marchio, sigla, comune)
        ]
    );

    const riepilogo = await resSeoRegione;

    const descrizioneCarburante = carburante ? carburante === 'benzina' ? ` della ${carburante}` : ` del ${carburante}` : ' del carburante';

    const localizzazione = comune
        ? `a ${ucwords(riepilogo.request.comune.description)} (${sigla?.toUpperCase()})`
        : sigla
            ? `in provincia di ${riepilogo.request.provincia_descrizione}`
            : `in ${ucwords(regione)}`;

    const descrizioneMarchio = marchio ? `${ucwords(marchio)} - ` : '';
    const descrizioneServizio = servizio ? `nei distributori con ${servizio.description.toLowerCase()}` : '';

    const titolo = `${descrizioneMarchio}Il prezzo ${descrizioneCarburante} ${descrizioneServizio} ${localizzazione} | PrezziBenzina.eu`;

    const stats = riepilogo.carburanti[carburante] || {};
    const prezzoMinimo = stats.min;

    const date = new Date(riepilogo.dataAggiornamento);

    const dateFormatted = new Intl.DateTimeFormat('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);

    const descrizione = `Prezzi ${carburante} ${localizzazione}${descrizioneMarchio} aggiornati al ${dateFormatted}. 
        Trova il distributore più conveniente tra ${riepilogo.totaleImpianti} impianti, a partire da ${prezzoMinimo} €/L.`;

    const canonicalUrl = getCanonicalUrl(regione, carburante, marchio, sigla, riepilogo.request.comune, servizio);

    console.log("CANONICAL", canonicalUrl);

    let fuel = '';
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';


    const imageUrl = comune
        ? process.env.NEXT_PUBLIC_API_ENDPOINT + `/pb/images/og/${comune}-${fuel}-1200-630`
        : sigla
            ? process.env.NEXT_PUBLIC_API_ENDPOINT + `/pb/images/og/${sigla}-${fuel}-1200-630`
            : process.env.NEXT_PUBLIC_API_ENDPOINT + `/pb/images/og/${regione}-${fuel}-1200-630`;

    const robots = riepilogo.totaleImpianti === 0 || riepilogo.request.index === 0 ? {
        index: false,
        follow: true,
    } : undefined;

    return {
        robots: robots,
        title: titolo,
        description: descrizione,
        alternates: {
            canonical: canonicalUrl.link,
            languages: {
                'it': canonicalUrl.link,
                'x-default': canonicalUrl.link,
            },
        },
        openGraph: {
            title: titolo,
            description: descrizione,
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
            title: titolo,
            description: descrizione,
            images: [imageUrl],
        },
    };

}

export const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const ucwords = (str) => {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

export function formatEuro(val) {
    if (!val) return 'n.d.';
    const num = parseFloat(val.replace(',', '.'));
    return isNaN(num) ? 'n.d.' : num.toFixed(3).replace('.', ',') + ' €/litro';
}

export function formatDate(iso) {
    if (!iso) return 'data non disponibile';
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

/*
export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-') // sostituisce spazi e simboli con -
}*/

export function generateMicrodataGraph(impianti, url, localita, carburante) {

    if (impianti.length === 0) {
        return null;
    }


    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

    // logDebug(impianti);
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
            image,
        } = impianto

        return {
            '@type': 'GasStation',
            '@id': `https://www.prezzibenzina.eu/impianto/${link}`,
            name: nome_impianto || impianto_scheda?.name || gestore,
            image: URI_IMAGE + image,
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


    const distributoreMigliore = impianti[0];
    const nomeMigliore = distributoreMigliore.nome_impianto || distributoreMigliore.impianto_scheda?.name || distributoreMigliore.gestore;

    const pompeBianche = impianti.filter(i => i.bandiera === 'Pompe Bianche');

    let faqPompeBianche = `Attualmente non ci sono pompe bianche indipendenti registrate ${localita}, ma i prezzi più bassi della zona sono comunque garantiti dalle stazioni in modalità self-service`;

    if (pompeBianche.length !== 0) {

        const nomePB = pompeBianche[0].nome_impianto || pompeBianche[0].impianto_scheda?.name || pompeBianche[0].gestore;

        faqPompeBianche =
            `Sì, ${localita} sono presenti distributori indipendenti (pompe bianche) ad esempio ${nomePB} in ${pompeBianche[0].indirizzo} a ${pompeBianche[0].comune} (${pompeBianche[0].provincia}), ` +
            'che spesso offrono tariffe altamente competitive rispetto ai grandi marchi.';
    }

    // 2. Il blocco delle FAQ
    const faqData = {
        "@type": "FAQPage",
        "@id": `https://www.prezzibenzina.eu${url.link}#faq`,
        "mainEntity": [
            {
                "@type": "Question",
                "name": `Qual è il distributore ${carburante} più economico oggi ${localita}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `In base agli ultimi aggiornamenti, il distributore più economico ${localita} è ${nomeMigliore} in ${distributoreMigliore.indirizzo} a ${distributoreMigliore.comune} (${distributoreMigliore.provincia})`
                }
            },
            {
                "@type": "Question",
                "name": `Ci sono pompe bianche o distributori no-logo ${localita}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faqPompeBianche
                }
            },

            {
                "@type": "Question",
                "name": `Ogni quanto vengono aggiornati i prezzi dei carburanti su questa pagina?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `I prezzi ${carburante} ${localita} vengono aggiornati quotidianamente. I dati provengono direttamente dalle comunicazioni ufficiali che i gestori dei distributori inviano all'Osservaprezzi del Ministero (MIMIT).`
                }
            },
        ]
    };

    return {
        '@context': 'https://schema.org',
        '@graph': [
            ...graph,
            faqData
        ]
    }
}

export function logDebug(message) {
    if (process.env.NODE_ENV === 'development') {
        /// console.log(message);
    }
}