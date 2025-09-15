import Header from "@/components/Header";
import SezioneTitolo from "@/components/SezioneTitolo";
import {getDistributoriRegione} from "@/functions/api";
import {getSeoRegione} from "@/functions/api";
import React from "react";
import SezioneComuni from "@/components/SezioneComuni";
import ElencoDistributori from "@/components/ElencoDistributori";
import FiltroCarburante, {LinkCarburanti} from "@/components/FiltroCarburante";
import FiltroMarchio, {LinkMarchio} from "@/components/FiltroMarchio";
import MappaWrapper from "@/components/MappaWrapper";
import Breadcrumb from "@/components/Breadcrumb";
import LinkComuni from "@/components/LinkComuni";

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

            <SezioneTitolo regione={regione} carburante={carburante} marchio={marchio} provincia={sigla} comune={comune}/>

            <form method={'post'} action={'/api/pb'}>
                <input type={'hidden'} name={'regione'} value={regione} />
                {/*<SezioneComuni comuni={comuni} provinciaSelezionata={sigla} selezionato={comune} />*/}
                <LinkComuni params={await params} comuni={comuni} />
                {/*<SeoTextRegione data={riepilogo}/>*/}

                <div className={'row'}>
                    <div className={'col-md-5'}>
                        <ElencoDistributori Regione={regione} distributori={distributori} />
                    </div>
                    <div className={'col-md-7'}>
                        <LinkCarburanti params={await params} carburanti={carburanti} />
                        <LinkMarchio params={await params} marchi={marchi} />
                        <Mappa distributori={distributori} /></div>
                </div>

            </form>



        </div>



    </>;


}