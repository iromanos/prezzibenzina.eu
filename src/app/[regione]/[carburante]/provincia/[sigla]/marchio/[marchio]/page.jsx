import DistributoriPage from "@/components/DistributoriPage";
import React from "react";
import {getMetadata} from "@/functions/helpers";


export async function generateMetadata({params}) {
    return getMetadata({params});
}


export default function Page({params}){

    return <DistributoriPage params={params} />

}