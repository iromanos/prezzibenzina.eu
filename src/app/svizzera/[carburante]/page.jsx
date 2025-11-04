import React from "react";
import DistributoriEsteriPage from "@/components/stati/DistributoriEsteriPage";
import {log} from "@/functions/helpers";


export default async function Page({params}) {

    const request = await params;

    request.stato = "svizzera";

    log(request);

    return <>
        <DistributoriEsteriPage params={request}/></>;

}