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
import {notFound} from "next/navigation";
import Display6977770298 from "@/components/ads/Display-6977770298";
import Display5745053645 from "./ads/Display-5745053645";
import {FooterDistributori} from "./home/FooterHome";
import {FooterMobile} from "./FooterMobile";
import {ucwords} from "@/functions/helpers";
import Image from "next/image";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {AdsDesktop} from "@/components/ads/AdsDesktop";
import * as turf from '@turf/turf';
import ImpiantoCardMobile from "@/components/impianti/ImpiantoCardMobile";


export default async function DistributoriPage({params}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;


    const {regione, carburante, marchio, sigla, comune} = await params;

    const elencoCarburanti = getCarburanti();
    const elencoMarchi = await getMarchi();


    console.log("MARCHI", elencoMarchi);

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

    const response = await getDistributoriRegione(regione, carburante, marchio, sigla, comune);

    const record = await response.json();

    const distributori = record.map(record => {
        record.stato = "IT";
        record.distance_km = null;
        return {
            geometry: {
                coordinates: [
                    record.latitudine,
                    record.longitudine
                ]
            },
            properties: record
        };
    })

    console.log(distributori);

    const riepilogo = await getSeoRegione(regione, carburante, marchio, sigla, comune);

    const comuni = riepilogo.comuni;
    const marchi = riepilogo.marchi;
    marchi.unshift({marchio: 'Tutti', key: null});

    const date = new Date(riepilogo.dataAggiornamento);

    const formatted = new Intl.DateTimeFormat('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);


    const {request} = riepilogo;


    const scope = request.comune
        ? {livello: 'comune', valore: request.comune.description}
        : request.provincia
            ? {livello: 'provincia', valore: request.provincia}
            : {livello: 'regione', valore: request.regione || regione};

    console.log(riepilogo);

    const localita =
        scope.livello === 'comune'
            ? `a ${ucwords(scope.valore)} (${request.provincia.toUpperCase()})`
            : scope.livello === 'provincia'
                ? `in provincia di ${request.provincia_descrizione}`
                : `in ${ucwords(scope.valore)}`;

    const coords = distributori
        .filter((d) => Number.isFinite(d.properties.longitudine) && Number.isFinite(d.properties.latitudine))
        .map((d) => [d.properties.longitudine, d.properties.latitudine]);


    const centerFeature = turf.center(turf.points(coords));
    const centerCoordinates = centerFeature.geometry.coordinates; // [Lng, Lat]


    console.log(centerCoordinates);

    function DistributoreMigliore() {
        if (distributori.length !== 0) {

            const d = distributori[0];

            return <div
                className={'bg-success-subtle rounded overflow-hidden'}>
                <p className={'m-0 text-center bg-success text-white text-uppercase small fw-bold'}>Il
                    più conveniente</p>
                <ImpiantoCardMobile
                    key={d.properties.id_impianto} impianto={d.properties}/>
            </div>
        }
        return <></>;
    }

    return <>
        <Header/>

        <div className="container py-4">

            <AdsDesktop className={'mb-3'}>
                <Display6977770298/>
            </AdsDesktop>

            <Breadcrumb
                riepilogo={riepilogo}
                regione={regione}
                carburante={carburante}
                provincia={sigla}
                comune={riepilogo.request.comune}
                marchio={marchio}/>


            <div className={'d-flex flex-column flex-md-row align-items-md-start align-items-center gap-4 mb-2'}>
                {marchio &&
                    <Image src={URI_IMAGE + `/impianto/logo/${marchio}/128`} alt={marchio} width={128} height={128}/>
                }
                <div>
                    <h1>Prezzi {carburante} {marchio ? ` ${ucwords(marchio)}` : ''} {localita}</h1>
                    <p className="lead text-muted">
                        Scopri i <strong>prezzi</strong> aggiornati della <strong>{carburante}</strong> {marchio ?
                        <strong>{ucwords(marchio)}</strong> : ''} {localita} e pianifica il tuo rifornimento in modo
                        intelligente.
                    </p></div>
            </div>

            <div className={'row'}>
                <div className={'col-lg-7'}>
                    <ul className={'list-unstyled'}>
                        <li><CheckBoxIcon className={'text-success'}/> Dati aggiornati: {formatted}</li>
                        <li><CheckBoxIcon className={'text-success'}/> Prezzi ufficiali MIMIT</li>
                        <li><CheckBoxIcon className={'text-success'}/> Rifornimento veloce e sicuro</li>
                    </ul>
                    <div className={'d-flex gap-2 mb-4 d-lg-none'}>
                        <a title={"Mappa"} href={"#mappa"} className={'btn btn-outline-primary'}><MapIcon/> Mappa</a>
                        <a title={"Elenco distributori"} href={"#distributori"}
                           className={'btn btn-primary'}><FormatListBulletedIcon/> Elenco
                            distributori</a>
                    </div>
                </div>
                <div className={'col d-lg-none mb-4'}>
                    <DistributoreMigliore/>
                </div>
                <div className={'col-lg-5'}>
                    <Display6977770298/>
                </div>

            </div>
            {comuni.length > 1 ? <LinkComuni
                riepilogo={riepilogo}
                comuni={comuni}/> : <></>}

            <div className={'mb-4'}>
            </div>


            <div className={'row'}>

                <div id={"mappa"} className={'col-lg-7 '}>
                    <div className={'row '}>
                        <div className={'col-auto'}>
                            <div className={'mb-4 border p-2 rounded'}>
                                <LinkCarburanti params={riepilogo.request} carburanti={carburanti} size={'sm'}/></div>
                        </div>
                        <div className={'col'}>
                            <LinkMarchio params={riepilogo.request} marchi={marchi}/></div>
                    </div>
                    {distributori.length !== 0 ? <Mappa
                        carburante={carburante}
                        posizione={{
                            longitude: centerCoordinates[0],
                            latitude: centerCoordinates[1],
                            zoom: 9,
                            fitBoundsOptions: {padding: 0}
                        }}

                        distributori={distributori}/> : <></>}
                    <Display5745053645/>
                    <div className={'card bg-white mb-3'}>
                        <div className={'card-body'}>
                            <IntroTextVersione2 data={riepilogo} distributori={distributori}/>
                        </div>
                    </div>
                    <Display6977770298 className={'mb-3'}/>

                </div>

                <div id="distributori" className={'col-lg-5 '}>
                    <ElencoDistributori Regione={regione} distributori={distributori}/>
                </div>
            </div>


        </div>

        <FooterMobile>
            <FooterDistributori/>
        </FooterMobile>
    </>;


}