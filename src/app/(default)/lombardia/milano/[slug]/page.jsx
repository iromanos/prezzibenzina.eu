import DistributoriPage from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/helpers";
import {notFound, permanentRedirect} from "next/navigation";
import {getElencoCarburanti, getMarchi, getServizi} from "@/functions/api";


// export const revalidate = 300;

export async function generateMetadata({params}) {
    const record = await getParams(params);


    const paramsPromise = Promise.resolve(record);

    return getMetadata({params: paramsPromise});
}

function generaUrlCanonico(record) {
    let pezzi = [`prezzo-${record.carburante}`];
    if (record.marchio) pezzi.push(record.marchio);
    if (record.servizio) pezzi.push(record.servizio.slug);
    return pezzi.join('-');
}

async function getParams(params) {
    const {slug} = await params;

    if (!slug.startsWith('prezzo-')) {
        notFound();
    }

    const [resServizi, resMarchi] = await Promise.all(
        [
            getServizi(),
            getMarchi()
        ]
    );

    const carburantiValidi = getElencoCarburanti();
    const serviziValidi = await resServizi;
    const marchiValidi = await resMarchi;

    const carburante = carburantiValidi.find(c => slug.includes(`prezzo-${c.tipo}`));
    if (!carburante) notFound();

    let stringaRimasta = slug.replace(`prezzo-${carburante.tipo}`, '');

    let marchio = null;
    let servizio = null;
    if (stringaRimasta) {

        const servizioTrovato = serviziValidi.find(s => stringaRimasta.includes(s.slug));
        if (servizioTrovato) {
            servizio = servizioTrovato;
            stringaRimasta = stringaRimasta.replace(servizioTrovato.slug, '').replace('--', '-');
            if (stringaRimasta.endsWith('-')) stringaRimasta = stringaRimasta.slice(0, -1);
            if (stringaRimasta.startsWith('-')) stringaRimasta = stringaRimasta.substring(1);
        }

        if (stringaRimasta) {
            const qry = marchiValidi.find(m => stringaRimasta.includes(`${m.id}`));
            if (qry) marchio = qry.id;
        }

        if (stringaRimasta && !marchio) {
            notFound();
        }

    }
    const record = {
        regione: 'lombardia',
        carburante: carburante.tipo,
        sigla: 'mi',
        comune: 'milano',
        marchio: marchio,
        servizio: servizio
    }

    return record;
}

export default async function Page({params}) {
    const record = await getParams(params);

    const {slug} = await params;

    const urlCorretto = generaUrlCanonico(record);
    console.log(slug);
    console.log(urlCorretto);

    if (slug !== urlCorretto) {
        console.log("REDIRECT");
        permanentRedirect(`/lombardia/milano/${urlCorretto}`);
    }

    return <DistributoriPage params={record}/>

}