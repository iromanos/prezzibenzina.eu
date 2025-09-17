import React from "react";
import {getMetadata} from "@/functions/api";
import DistributoriPage from "@/components/DistributoriPage";


export async function generateMetadata({params}) {
    return getMetadata({params});
}


export default async function Page({params}) {


    return <>
        <DistributoriPage params={params}/></>;

}