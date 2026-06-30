import DistributoriPage from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/helpers";
import {notFound} from "next/navigation";

// export const revalidate = 300;

export async function generateMetadata({params}) {

    const record = await getParams(params);

    const paramsPromise = Promise.resolve(record);

    return getMetadata({params: paramsPromise});
}


async function getParams(params) {
    const {slug} = await params;

    if (!slug.startsWith('prezzo-')) {
        notFound();
    }

    // Elenco dei carburanti validi per capire dove finisce il carburante e dove inizia il marchio
    const carburantiValidi = ['benzina', 'diesel', 'gpl', 'metano'];

    // Troviamo quale carburante è presente nello slug
    const carburante = carburantiValidi.find(c => slug.includes(`prezzo-${c}`));

    if (!carburante) {
        notFound(); // Se non trova un carburante valido (es: prezzo-fanta-api-ip), 404
    }

    // Sottraiamo "prezzo-[carburante]-" dallo slug originale per isolare il marchio
    // Es: "prezzo-benzina-api-ip" diventa "api-ip"
    const stringaRimasta = slug.replace(`prezzo-${carburante}`, '');

    // Se la stringa rimasta inizia con un trattino (es: "-api-ip"), lo puliamo, altrimenti il marchio è null
    const marchio = stringaRimasta.startsWith('-')
        ? stringaRimasta.substring(1) // Toglie il primo trattino e tiene "api-ip"
        : null;


    const record = {
        regione: 'lombardia',
        carburante: carburante,
        sigla: 'mi',
        comune: 'milano',
        marchio: marchio
    }

    console.log(record);

    return record;
}

export default async function Page({params}) {


    const record = await getParams(params);

    return <DistributoriPage params={record}/>

}