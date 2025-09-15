import DistributoriPage from "@/components/DistributoriPage";
import React from "react";
import {capitalize, getMetadata} from "@/functions/api";




export async function generateMetadata({params}) {
    return getMetadata({params});
}


export default function Page({params}){

    return <DistributoriPage params={params} />

}