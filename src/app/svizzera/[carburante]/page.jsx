import React from "react";
import DistributoriEsteriPage from "@/components/stati/DistributoriEsteriPage";
import {getMetadataEstero} from "@/functions/helpers";
import Footer from "@/components/Footer";

export async function generateMetadata({params}) {
    const request = await params;

    request.stato = "svizzera";

    return getMetadataEstero({params: request});
}

export default async function Page({params}) {

    const request = await params;

    request.stato = "svizzera";

    return <>
        <DistributoriEsteriPage params={request}/>
        <Footer/>
    </>;

}