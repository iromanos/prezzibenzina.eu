import DistributoriPage from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/helpers";
import {notFound} from "next/navigation";

// export const revalidate = 43200;
export const revalidate = 300;


export async function generateMetadata({params}) {

    const record = await getParams(params);

    console.log("RECORD", record);

    const paramsPromise = Promise.resolve(record);

    return getMetadata({params: paramsPromise});
}


async function getParams(params) {
    const {slug} = await params;

    if (!slug.startsWith('prezzo-')) {
        notFound();
    }

    const carburante = slug.replace('prezzo-', '');

    const record = {
        regione: 'lombardia',
        carburante: carburante,
        sigla: 'mi',
        comune: 'milano',
    }

    return record;
}

export default async function Page({params}) {


    const record = await getParams(params);

    return <DistributoriPage params={record}/>

}