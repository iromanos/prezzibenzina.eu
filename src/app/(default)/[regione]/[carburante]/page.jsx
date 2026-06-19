import React from "react";
import {getMetadata} from "@/functions/helpers";
import DistributoriPage from "@/components/DistributoriPage";


// export const revalidate = 43200;


export async function generateMetadata({params}) {
    return getMetadata({params});
}


export default async function Page({params}) {


    return <>
        <DistributoriPage params={params}/></>;

}