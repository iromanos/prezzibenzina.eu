'use client'
import {LinkCarburanti} from "@/components/FiltroCarburante";
import React from "react";

export default function DistributoriEsteriClient({riepilogo}) {

    return <LinkCarburanti
        size={null}
        showTitle={false} onCarburanteChange={(value) => {
        window.location = "/" + riepilogo.request.stato + "/" + value;

    }} params={riepilogo.request}/>

}