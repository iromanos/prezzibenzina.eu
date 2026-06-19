import DistributoriPage from "@/components/DistributoriPage";
import {getMetadata} from "@/functions/helpers";

// export const revalidate = 43200;

export async function generateMetadata({params}, {request}) {
    return getMetadata({params}, {request});
}

export default function Page({params}){

    return <DistributoriPage params={params} />

}