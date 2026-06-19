import Header from "@/components/Header";
import {getCarburanti, getElencoStati, getImpiantiByDistance, getMarchi, getSeoRegioneEstera} from "@/functions/api";
import React from "react";
import ElencoDistributori from "@/components/ElencoDistributori";
import Mappa from "@/components/Mappa";
import MapIcon from '@mui/icons-material/Map';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import {notFound, redirect} from "next/navigation";
import {ucwords} from "@/functions/helpers";
import {IntroTextEstero} from "@/components/IntroTextEstero";
import {FooterMobile} from "@/components/FooterMobile";
import FooterHome from "@/components/home/FooterHome";
import DistributoriEsteriClient from "@/components/stati/DistributoriEsteriClient";
import Display6977770298 from "@/components/ads/Display-6977770298";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {AdsDesktop} from "@/components/ads/AdsDesktop";

export default async function DistributoriEsteriPage({params}) {

    const {stato, regione, carburante, marchio} = await params;

    const elencoCarburanti = getCarburanti();
    const elencoMarchi = await getMarchi();

    const elencoStati = getElencoStati();

    const queryStati = elencoStati.filter(s => s.key === stato);

    if (queryStati.length === 0) {
        notFound();
    }
    const recordStato = queryStati[0];

    // console.log(elencoCarburanti);

    if (elencoCarburanti[carburante] === undefined) {
        redirect(`/${recordStato.key}/benzina`);
    }

    if (marchio !== undefined) {
        if (elencoMarchi.filter(m => m.id === marchio).length === 0) {
            notFound();
        }
    }

    const responseSEO = await getSeoRegioneEstera(stato, regione, carburante);

    if (responseSEO.status === 404) {
        notFound();
    }

    const riepilogo = await responseSEO.json();


    const response = await getImpiantiByDistance({stato: recordStato.key, carburante: carburante, limit: 10});

    // console.log(response);

    const records = await response.json();

    const distributori = records.map(record => {
        record.properties.distance_km = null;
        record.properties.longitudine = parseFloat(record.properties.longitudine);
        record.properties.latitudine = parseFloat(record.properties.latitudine);
        return record;
    })

    // console.log(distributori);

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
        <div className="container py-4">

            <AdsDesktop className={'mb-3'}>
                <Display6977770298/>
            </AdsDesktop>

            <h1>Prezzi {carburante} {marchio ? ` ${marchio}` : ''} {localita}</h1>
            <p className="lead text-muted">
                Scopri i <strong>prezzi</strong> aggiornati della <strong>{carburante}</strong> {marchio ?
                <strong>{marchio}</strong> : ''} {localita} e pianifica il tuo rifornimento in modo intelligente.
            </p>


            <div className={'row'}>
                <div id="distributori" className={'col-md-4 order-1'}>
                    <ElencoDistributori Regione={regione} distributori={distributori}/>
                </div>
                <div id={"mappa"} className={'col-md-8 order-0'}>

                    <ul className={'list-unstyled'}>
                        <li><CheckBoxIcon className={'text-success'}/> Dati aggiornati: {formatted}</li>
                        <li><CheckBoxIcon className={'text-success'}/> Prezzi ufficiali MIMIT</li>
                        <li><CheckBoxIcon className={'text-success'}/> Rifornimento veloce e sicuro</li>
                    </ul>
                    <div className={'d-flex gap-2 mb-4 border-bottom pb-4'}>
                        <a title={"Elenco distributori"} href={"#distributori"}
                           className={'btn btn-primary '}><FormatListBulletedIcon/> Elenco
                            distributori</a>
                        <a title={"Mappa"} href={"#mappa"} className={'btn btn-outline-primary '}><MapIcon/> Mappa</a>
                        <div className={'ms-auto'}><DistributoriEsteriClient riepilogo={riepilogo}/></div>
                    </div>

                    {distributori.length !== 0 ?
                        <Mappa
                            stato={recordStato.key}
                            carburante={carburante}
                            posizione={{
                                zoom: recordStato.zoom,
                                latitude: recordStato.lat,
                                longitude: recordStato.lng
                            }} distributori={distributori}/> :
                        <></>}
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