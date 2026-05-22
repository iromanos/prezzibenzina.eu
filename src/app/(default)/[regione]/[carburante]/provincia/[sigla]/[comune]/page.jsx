import DistributoriPage from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/helpers";

export const revalidate = 43200;

export async function generateMetadata({params}) {
    return getMetadata({params});
}

export default function ComunePage({params}){

    return <DistributoriPage params={params} />

}