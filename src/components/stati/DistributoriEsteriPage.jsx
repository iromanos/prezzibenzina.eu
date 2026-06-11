import Header from "@/components/Header";
import {getCarburanti, getImpiantiByDistance, getMarchi, getSeoRegioneEstera} from "@/functions/api";
import React from "react";
import ElencoDistributori from "@/components/ElencoDistributori";
import Mappa from "@/components/Mappa";
import MapIcon from '@mui/icons-material/Map';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import {notFound} from "next/navigation";
import {logDebug, ucwords} from "@/functions/helpers";
import {IntroTextEstero} from "@/components/IntroTextEstero";
import {FooterMobile} from "@/components/FooterMobile";
import FooterHome from "@/components/home/FooterHome";
import DistributoriEsteriClient from "@/components/stati/DistributoriEsteriClient";
import Display6977770298 from "@/components/ads/Display-6977770298";

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


    const response = await getImpiantiByDistance({stato: stato, carburante: carburante, limit: 10});

    console.log(response);

    const records = await response.json();

    const distributori = records.map(record => {
        const impianto = record.properties;
        impianto.latitudine = parseFloat(record.properties.latitudine);
        impianto.longitudine = parseFloat(record.properties.longitudine);

        logDebug(impianto);

        return impianto;
    })

    logDebug(distributori);


    const date = new Date(riepilogo.dataAggiornamento);


    const formatted = new Intl.DateTimeFormat('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);

    const request = riepilogo.request;

    const scope = request.regione
        ? {livello: 'regione', valore: request.regione}
        : {livello: 'stato', valore: request.stato};

    const localita =
        scope.livello === 'comune'
            ? `a ${ucwords(scope.valore)}`
            : scope.livello === 'provincia'
                ? `in provincia di ${scope.valore.toUpperCase()}`
                : `in ${ucwords(scope.valore)}`;
    /*
    const marchi = riepilogo.marchi;
    */
    return <>
        <Header/>

        <div className="container py-5">

            <h1>Prezzi {carburante} {marchio ? ` ${marchio}` : ''} {localita}</h1>
            <p className="lead text-muted">
                Scopri i <strong>prezzi</strong> aggiornati della <strong>{carburante}</strong> {marchio ?
                <strong>{marchio}</strong> : ''} {localita} e pianifica il tuo rifornimento in modo intelligente.
            </p>
            <ul className={'list-unstyled'}>
                <li>✅ Dati aggiornati: {formatted}</li>
                <li>✅ Prezzi ufficiali MIMIT</li>
                <li>✅ Rifornimento veloce e sicuro</li>
            </ul>
            <div className={'d-flex gap-2 mb-4'}>
                <a title={"Elenco distributori"} href={"#distributori"}
                   className={'btn btn-primary '}><FormatListBulletedIcon/> Elenco
                    distributori</a>
                <a title={"Mappa"} href={"#mappa"} className={'btn btn-outline-primary '}><MapIcon/> Mappa</a>
            </div>



            <div className={'row'}>
                <div id="distributori" className={'col-md-4 order-1'}>
                    <ElencoDistributori Regione={regione} distributori={distributori}/>
                </div>
                <div id={"mappa"} className={'col-md-8 order-0'}>

                    <DistributoriEsteriClient riepilogo={riepilogo}/>

                    {distributori.length !== 0 ? <Mappa distributori={distributori}/> : <></>}
                    <div className={'mb-4'}>
                        <Display6977770298/>
                    </div>
                    <div className={'card bg-white mb-3'}>
                        <div className={'card-body'}>
                            <IntroTextEstero data={riepilogo} distributori={distributori}/>
                        </div>
                    </div>
                    <div className={'mb-4'}>
                        <Display6977770298/>
                    </div>
                </div>
            </div>


        </div>

        <FooterMobile>
            <FooterHome/>
        </FooterMobile>

    </>;


}