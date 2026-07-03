import DistributoriPage, {getPageParams} from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/helpers";

//export const revalidate = 43200;
export const revalidate = 300;

export async function generateMetadata({params, searchParams}) {
    const record = await getPageParams({params, searchParams});
    return getMetadata({params: Promise.resolve(record)});
}

export default async function ComunePage({params, searchParams}) {
    const record = await getPageParams({params, searchParams});
    return <DistributoriPage params={record}/>
}