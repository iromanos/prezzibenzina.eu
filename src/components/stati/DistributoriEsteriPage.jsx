import Header from "@/components/Header";
import {getCarburanti, getImpiantiByDistance, getMarchi, getSeoRegioneEstera} from "@/functions/api";
import React from "react";
import ElencoDistributori from "@/components/ElencoDistributori";
import LinkComuni from "@/components/LinkComuni";
import Mappa from "@/components/Mappa";
import MapIcon from '@mui/icons-material/Map';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import {notFound} from "next/navigation";
import {log} from "@/functions/helpers";
import {IntroTextEstero} from "@/components/IntroTextEstero";

export default async function DistributoriEsteriPage({params}) {

    const {stato, regione, carburante, marchio} = await params;

    const responseSEO = await getSeoRegioneEstera(stato, regione, carburante);

    if (responseSEO.status === 404) {
        notFound();
    }

    const riepilogo = await responseSEO.json();

    const elencoCarburanti = getCarburanti();
    const elencoMarchi = await getMarchi();

    if (elencoCarburanti[carburante] === undefined) {
        notFound();
    }

    if (marchio !== undefined) {
        if (elencoMarchi.filter(m => m.id === marchio).length === 0) {
            notFound();
        }
    }

    const carburanti = Object.keys(elencoCarburanti).map(nome => {
        return `${nome}`;
    });

    const response = await getImpiantiByDistance({stato: stato, carburante: carburante, limit: 10});


    const records = await response.json();

    const distributori = records.map(record => {
        const impianto = record.properties;
        impianto.latitudine = parseFloat(record.properties.latitudine);
        impianto.longitudine = parseFloat(record.properties.longitudine);

        log(impianto);

        return impianto;
    })

    log(distributori);


    const date = new Date(riepilogo.dataAggiornamento);


    const formatted = new Intl.DateTimeFormat('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
    const comuni = riepilogo.comuni;

    /*
    const marchi = riepilogo.marchi;
    */
    return <>
        <Header/>

        <div className="container py-5">

            {/*<Breadcrumb*/}
            {/*    riepilogo={riepilogo}*/}
            {/*    regione={regione}*/}
            {/*    carburante={carburante}*/}
            {/*    provincia={sigla}*/}
            {/*    comune={riepilogo.request.comune}*/}
            {/*    marchio={marchio}/>*/}

            <IntroTextEstero data={riepilogo} distributori={distributori}>
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
                    comuni={comuni}/> : <></>}
            </IntroTextEstero>

            <div className={'row'}>
                <div id="distributori" className={'col-md-5 order-1'}>
                    <ElencoDistributori Regione={regione} distributori={distributori}/>
                    {/*<ComparaVicini carburante={carburante}/>*/}
                </div>
                <div id={"mappa"} className={'col-md-7 order-0'}>
                    {/*<LinkCarburanti params={riepilogo.request} carburanti={carburanti}/>*/}
                    {/*<LinkMarchio params={riepilogo.request} marchi={marchi}/>*/}
                    {distributori.length !== 0 ? <Mappa distributori={distributori}/> : <></>}
                </div>
            </div>


        </div>


    </>;


}