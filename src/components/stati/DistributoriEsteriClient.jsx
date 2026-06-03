'use client'
import {LinkCarburanti} from "@/components/FiltroCarburante";
import React from "react";
import {getCarburanti} from "@/functions/api";
// import useCarburante from "@/hooks/useCarburante";

export default function DistributoriEsteriClient({riepilogo}) {

    const elencoCarburanti = getCarburanti();
    // const {carburante} = useCarburante();


    const carburanti = Object.keys(elencoCarburanti).map(nome => {
        return `${nome}`;
    });

    // console.log(riepilogo);

    return <LinkCarburanti onCarburanteChange={(value) => {
        window.location = "/" + riepilogo.request.stato + "/" + value;

    }} params={riepilogo.request} carburanti={carburanti}/>

}