import Link from 'next/link';
import MappaWrapper from "@/components/MappaWrapper";
import axios from "axios";
import Header from "@/components/Header";
import SeoTextRegione from "@/components/SeoTextRegione";
import FiltroMarchio from "@/components/FiltroMarchio";
import React from "react";
import FiltroCarburante from "@/components/FiltroCarburante";
import ElencoDistributori from "@/components/ElencoDistributori";
import SezioneTitolo from "@/components/SezioneTitolo";
import {getDistributoriRegione, getMetadata} from "@/functions/api";
import {getSeoRegione} from "@/functions/api";
import SezioneComuni from "@/components/SezioneComuni";
import DistributoriPage from "@/components/DistributoriPage";

export async function generateMetadata({params}) {
    // console.log("REQUEST: " + request);
    return getMetadata({params});
}


export default function Page({params}){

    return <DistributoriPage params={params} />

}