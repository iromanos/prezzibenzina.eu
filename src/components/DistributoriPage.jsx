import Header from "@/components/Header";
import {getCarburanti, getDistributoriRegione, getMarchi, getSeoRegione} from "@/functions/api";
import React from "react";
import ElencoDistributori from "@/components/ElencoDistributori";
import {FiltroMarchio} from "@/components/FiltroMarchio";
import Breadcrumb from "@/components/Breadcrumb";
import LinkComuni from "@/components/LinkComuni";
import Mappa from "@/components/Mappa";
import {notFound} from "next/navigation";
import Display6977770298 from "@/components/ads/Display-6977770298";
import {FooterDistributori} from "./home/FooterHome";
import {FooterMobile} from "./FooterMobile";
import {generateMicrodataGraph, getCanonicalUrl, ucwords} from "@/functions/helpers";
import Image from "next/image";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {AdsDesktop} from "@/components/ads/AdsDesktop";
import * as turf from '@turf/turf';
import ImpiantoCardMobile from "@/components/impianti/ImpiantoCardMobile";
import {GuidaCarburantiAutomobilistaVER3} from "@/components/GuidaCarburantiAutomobilista";
import FiltroCarburante from "@/components/FiltroCarburante";
//TODO: visualizzare grafico con la media dei prezzi dell'ultimo mese
import '../styles/milano.scss';


export default async function DistributoriPage({params}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

    const {regione, carburante, marchio, sigla, comune, servizio} = await params;

    const elencoCarburanti = getCarburanti();


    const [resMarchi, resDistributori, resSeoRegione] = await Promise.all(
        [
            getMarchi(),
            getDistributoriRegione(regione, carburante, marchio, sigla, comune),
            getSeoRegione(regione, carburante, marchio, sigla, comune)
        ]
    );

    const elencoMarchi = await resMarchi;

    if (elencoCarburanti[carburante] === undefined) {
        notFound();
    }

    if (marchio !== undefined && marchio !== null) {
        if (elencoMarchi.filter(m => m.id === marchio).length === 0) {
            notFound();
        }
    }

    const carburanti = Object.keys(elencoCarburanti).map(nome => {
        return `${nome}`;
    });

    const record = await resDistributori;

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


    const riepilogo = await resSeoRegione;


    const canonicalUrl = getCanonicalUrl(regione, carburante, marchio, sigla, riepilogo.request.comune);

    // console.log("CANONICAL", canonicalUrl);

    const comuni = riepilogo.comuni;
    const marchi = riepilogo.marchi;
    marchi.unshift({marchio: 'Tutti', key: null, impianti: riepilogo.totaleImpianti});

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


    const localita =
        scope.livello === 'comune'
            ? `a ${ucwords(scope.valore)}` // (${request.provincia.toUpperCase()})
            : scope.livello === 'provincia'
                ? `in provincia di ${request.provincia_descrizione}`
                : `in ${ucwords(scope.valore)}`;

    riepilogo.localita = localita;

    const microdata = generateMicrodataGraph(record, canonicalUrl, localita, carburante);

    //console.log( JSON.stringify( microdata));

    const coords = distributori
        .filter((d) => Number.isFinite(d.properties.longitudine) && Number.isFinite(d.properties.latitudine))
        .map((d) => [d.properties.longitudine, d.properties.latitudine]) || null;


    const centerFeature = distributori.length !== 0 ? turf.center(turf.points(coords)) : null;
    const centerCoordinates = centerFeature !== null ? centerFeature.geometry.coordinates : null;

    const descrizioneCarburante = carburante ? carburante === 'benzina' ? ` della ${carburante}` : ` del ${carburante}` : ' del carburante';
    const descrizioneServizio = servizio ? `con ${servizio.description.toLowerCase()}` : '';

    let titoloPagina = ''; //`Prezzo ${descrizioneCarburante} ${descrizioneServizio} ${localita} oggi`;

    if (marchio && servizio) {
        titoloPagina = `Distributori ${marchio.toUpperCase()} ${descrizioneServizio} ${localita}: Prezzo ${descrizioneCarburante}`;
    } else if (servizio) {
        titoloPagina = `Prezzo ${descrizioneCarburante} nei distributori ${descrizioneServizio} ${localita}`;
    } else if (marchio) {
        titoloPagina = `Prezzo ${descrizioneCarburante} nei distributori ${marchio.toUpperCase()} ${localita}`;
    } else titoloPagina = `Prezzo ${descrizioneCarburante} ${localita}`;


    riepilogo.request.marchio = riepilogo.marchio;

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

    function maxBounds() {
        const boundsString = riepilogo.request.comune.bounds;

        const data = JSON.parse(boundsString);

        // 2. Destrutturiamo il bbox (che sono stringhe) e le convertiamo in numeri
        const [latMin, latMax, lngMin, lngMax] = data.bbox.map(Number);

        // 4. Formattiamo i Bounds per MapLibre: [ [LngMin, LatMin], [LngMax, LatMax] ]
        const maxBounds = [
            [lngMin, latMin], // Angolo Sud-Ovest
            [lngMax, latMax]  // Angolo Nord-Est
        ];

        return maxBounds;
    }

    return <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(microdata)}}
        />

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
                    <Image
                        unoptimized

                        src={URI_IMAGE + `/impianto/logo/${marchio}/128`} alt={marchio} width={128} height={128}/>
                }
                <div>
                    <h1 className={'fs-1'}>{titoloPagina}</h1>
                    <p className="lead text-muted">
                        Scopri i <strong>prezzi</strong> aggiornati <strong>{descrizioneCarburante}</strong> {marchio ?
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
                </div>
                <div className={'col d-lg-none mb-4'}>
                    <DistributoreMigliore/>
                </div>
                <div className={'col-lg-5'}>
                    <Display6977770298 className={'mb-4'}/>
                </div>

            </div>
            {comuni.length > 1 ? <LinkComuni
                riepilogo={riepilogo}
                comuni={comuni}/> : <></>}

            <div className={'row container-principale'}>

                <div id={"mappa"} className={'sezione-mappa'}>

                    <div className={'d-lg-block '}>
                        <FiltroCarburante selezionato={carburante} params={riepilogo.request}/>
                    </div>

                    <div className={'d-lg-block'}>
                        <FiltroMarchio selezionato={riepilogo.marchio} marchi={marchi} params={riepilogo.request}/>
                    </div>

                    {distributori.length !== 0 ?
                        <Mappa
                            params={riepilogo}
                            titolo={`Mappa dei distributori ${localita}`}
                            carburante={carburante}

                            posizione={{
                                longitude: centerCoordinates[0],
                                latitude: centerCoordinates[1],
                                zoom: 9,
                                fitBoundsOptions: {padding: 10}
                            }}

                            distributori={distributori}/>

                        : <></>}

                    {distributori.length === 0 && <>
                        <div className={'bg-danger-subtle border border-danger rounded p-3 mb-3'}>
                            Non sono presenti distributori in questa zona
                        </div>

                    </>}

                    <Display6977770298 className={'mb-3'}/>
                </div>
                {distributori.length !== 0 &&
                    <div id="distributori" className={'sezione-elenco'}>
                    <ElencoDistributori Regione={regione} distributori={distributori}/>
                </div>}
                {distributori.length !== 0 && <div className={'sezione-descrizione'}>

                    <GuidaCarburantiAutomobilistaVER3 riepilogo={riepilogo} distributori={distributori}
                                                      titoloPagina={titoloPagina}/>
                </div>}

            </div>

        </div>

        <FooterMobile>
            <FooterDistributori/>
        </FooterMobile>
    </>;


}