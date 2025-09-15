import DistributoriPage from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/api";

export async function generateMetadata({params}) {
    return getMetadata({params});
}

export default function ComunePage({params}){

    return <DistributoriPage params={params} />

}