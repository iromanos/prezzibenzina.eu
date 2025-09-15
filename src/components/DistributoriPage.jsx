import Header from "@/components/Header";
import SezioneTitolo from "@/components/SezioneTitolo";
import {getDistributoriRegione, getSeoRegione} from "@/functions/api";
import React from "react";
import ElencoDistributori from "@/components/ElencoDistributori";
import {LinkCarburanti} from "@/components/FiltroCarburante";
import {LinkMarchio} from "@/components/FiltroMarchio";
import MappaWrapper from "@/components/MappaWrapper";
import Breadcrumb from "@/components/Breadcrumb";
import LinkComuni from "@/components/LinkComuni";
import SeoTextRegione from "@/components/SeoTextRegione";
import {IntroText} from "@/components/IntroText";

export default async function DistributoriPage({params}) {

    // console.log(params);

    const {regione, carburante, marchio, sigla, comune} = await params;

    const distributori = await getDistributoriRegione(regione, carburante, marchio, sigla, comune);
    const riepilogo = await getSeoRegione(regione, carburante, marchio, sigla, comune);

    const comuni = riepilogo.comuni;
    const marchi = riepilogo.marchi;

    const carburanti = ['benzina', 'diesel', 'gpl', 'metano'];



    function Mappa({distributori}){
        return <section className={"mb-4"}>
            <h2 className="h5 mb-3">Mappa dei distributori</h2>
            <MappaWrapper distributori={distributori}/>
        </section>;
    }


    return <>

        <Header/>

        <div className="container py-5">

            <Breadcrumb regione={regione} carburante={carburante} provincia={sigla} comune={comune} marchio={marchio} />

                <IntroText data={riepilogo}>
                    <LinkComuni params={await params} comuni={comuni} />
                </IntroText>

                <div className={'row'}>
                    <div className={'col-md-5'}>
                        <ElencoDistributori Regione={regione} distributori={distributori} />
                    </div>
                    <div className={'col-md-7'}>
                        <LinkCarburanti params={await params} carburanti={carburanti} />
                        <LinkMarchio params={await params} marchi={marchi} />
                        {/*<Mappa distributori={distributori} />*/}
                    </div>
                </div>


        </div>



    </>;


}