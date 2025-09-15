import Header from "@/components/Header";
import SezioneTitolo from "@/components/SezioneTitolo";
import DistributoriPage from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/api";


export async function generateMetadata({params}, {request}) {
    return getMetadata({params}, {request});
}

export default function Page({params}){

    return <DistributoriPage params={params} />

}