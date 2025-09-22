import DistributoriPage from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/helpers";


export async function generateMetadata({params}, {request}) {
    return getMetadata({params}, {request});
}

export default function Page({params}){

    return <DistributoriPage params={params} />

}