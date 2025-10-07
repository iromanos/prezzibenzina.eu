import Header from "@/components/Header";
import {getCarburanti, getDistributoriRegione, getMarchi, getSeoRegione} from "@/functions/api";
import React from "react";
import ElencoDistributori from "@/components/ElencoDistributori";
import {LinkCarburanti} from "@/components/FiltroCarburante";
import {LinkMarchio} from "@/components/FiltroMarchio";
import Breadcrumb from "@/components/Breadcrumb";
import LinkComuni from "@/components/LinkComuni";
import {IntroTextVersione2} from "@/components/IntroText";
import Mappa from "@/components/Mappa";
import MapIcon from '@mui/icons-material/Map';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ComparaVicini from "@/components/ComparaVicini";
import {notFound} from "next/navigation";
import {log} from "@/functions/helpers";

export default async function DistributoriPage({params}) {

    const {regione, carburante, marchio, sigla, comune} = await params;

    const elencoCarburanti = getCarburanti();
    const elencoMarchi = await getMarchi();

    if (elencoCarburanti[carburante] === undefined) {
        notFound();
    }

    log(elencoMarchi);

    if (marchio !== undefined) {
        if (elencoMarchi.filter(m => m.id === marchio).length === 0) {
            notFound();
        }
    }


    const carburanti = Object.keys(elencoCarburanti).map(nome => {
        return `${nome}`;
    });

    const response = await getDistributoriRegione(regione, carburante, marchio, sigla, comune);


    const distributori = await response.json();

    const riepilogo = await getSeoRegione(regione, carburante, marchio, sigla, comune);

    const comuni = riepilogo.comuni;
    const marchi = riepilogo.marchi;

    const date = new Date(riepilogo.dataAggiornamento);

    const formatted = new Intl.DateTimeFormat('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);

    return <>
        <Header/>

        <div className="container py-5">

            <Breadcrumb
                riepilogo={riepilogo}
                regione={regione}
                carburante={carburante}
                provincia={sigla}
                comune={comune}
                marchio={marchio}/>

            <IntroTextVersione2 data={riepilogo} distributori={distributori}>
                <ul className={'list-unstyled'}>
                    <li>✅ Dati aggiornati: {formatted}</li>
                    <li>✅ Prezzi ufficiali MIMIT</li>
                    <li>✅ Rifornimento veloce e sicuro</li>
                </ul>
                <div className={'d-flex gap-2 mb-4'}>
                    <a title={"Elenco distributori"} href={"#distributori"}
                       className={'btn btn-primary'}><FormatListBulletedIcon/> Elenco
                        distributori</a>
                    <a title={"Mappa"} href={"#mappa"} className={'btn btn-outline-primary'}><MapIcon/> Mappa</a>
                </div>
                {comuni.length > 1 ? <LinkComuni
                    riepilogo={riepilogo}
                    params={await params}
                    comuni={comuni}/> : <></>}
            </IntroTextVersione2>

            <div className={'row'}>
                <div id="distributori" className={'col-md-5 order-1'}>
                    <ElencoDistributori Regione={regione} distributori={distributori}/>
                    <ComparaVicini carburante={carburante}/>
                </div>
                <div id={"mappa"} className={'col-md-7 order-0'}>
                    <LinkCarburanti params={await params} carburanti={carburanti}/>
                    <LinkMarchio params={await params} marchi={marchi}/>
                    {distributori.length !== 0 ? <Mappa distributori={distributori}/> : <></>}
                </div>
            </div>


        </div>


    </>;


}