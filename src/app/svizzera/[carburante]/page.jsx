import React from "react";
import DistributoriEsteriPage from "@/components/stati/DistributoriEsteriPage";
import {getMetadataEstero, logDebug} from "@/functions/helpers";
import Footer from "@/components/Footer";


export async function generateMetadata({params}) {
    return getMetadataEstero({params});
}

export default async function Page({params}) {

    const request = await params;

    request.stato = "svizzera";

    logDebug(request);

    return <>
        <DistributoriEsteriPage params={request}/>

        <Footer/>

    </>;

}