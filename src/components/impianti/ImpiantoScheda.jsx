'use client';
import React, {useState} from 'react';
import Map, {Popup} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";
import ImpiantoPopup from "@/components/impianti/ImpiantoPopup";
import {isMobile} from "react-device-detect";
import FavoriteToggle from "@/components/FavoriteToogle";
import ShareButton from "@/components/ShareButton";
import ComparaVicini from "@/components/ComparaVicini";
import {log, slugify, ucwords} from "@/functions/helpers";
import ImpiantoDescrizione from "@/components/impianti/ImpiantoDescrizione";
import {getElencoCarburanti} from "@/functions/api";
import Breadcrumb from "@/components/Breadcrumb";

export default function ImpiantoScheda({impianto, cookie}) {
    const [showPopup, setShowPopup] = useState(false);
    const styleUrl = 'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';
    const URI_IMAGE = process.env.NEXT_PUBLIC_API_ENDPOINT;

    const confrontaVicini = () => {
        log('compare:open');
        window.dispatchEvent(new CustomEvent('compare:open', {
            detail: {
                lat: impianto.latitudine,
                lng: impianto.longitudine,
                id: impianto.id_impianto,
                radius: 2,
            }
        }));
    };

    const {
        nome_impianto,
        gestore,
        bandiera,
        indirizzo,
        provincia,
        latitudine,
        longitudine,
        image,
        link,
        prezzi,
    } = impianto;

    const prezzo = () => {
        const carburanti = getElencoCarburanti();

        log(carburanti);
        const fuel = carburanti.find(c => c.tipo === cookie.carburante);
        log(fuel);
        log(prezzi);

        const prezzo = prezzi.find(p => p.fuel_id === fuel.fuel_id);
        try {
            if (prezzo === undefined) {
                if (prezzi.length !== 0) {
                    return prezzi[0].prezzo;
                }
            }
            return prezzo.prezzo;
        } catch (e) {

        }
        return 0;
    }

    impianto.prezzo = prezzo();

    const comune = () => {
        if (impianto.comune === "") return null;
        return {id: slugify(impianto.comune), description: ucwords(impianto.comune)};
    }


    return (
        <div className="container py-4">

            <Breadcrumb
                stato={impianto.stato}
                regione={impianto.regione}
                carburante={cookie.carburante}
                provincia={impianto.provincia}
                comune={comune()}
                impianto={impianto}
            />



            <div className={'row'}>
                <div className={'col-lg-7 mb-4'}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <img src={URI_IMAGE + impianto.image} alt={impianto.bandiera} width={96} height={96}/>
                        <div>
                            <h1 className="mb-0">{impianto.nome_impianto}</h1>
                            <small className="text-muted">{impianto.gestore}</small>
                        </div>
                    </div>

                    <ImpiantoDescrizione impianto={impianto}/>
                    <h2>Indirizzo</h2>
                    <p>{indirizzo}{impianto.comune ? `, ${ucwords(impianto.comune)}` : null} {provincia ? `($\{provincia})` : null}</p>
                    <div className={'mb-2'}>
                        <h2>Carburanti disponibili</h2>
                        <table className="table table-bordered align-middle">
                            <thead className="table-light">
                            <tr>
                                <th scope="col">Tipo</th>
                                <th scope="col" className={'text-end'}>Prezzo €/L</th>
                            </tr>
                            </thead>
                            <tbody>
                            {prezzi.map((f, i) => (
                                <tr key={i} className="">
                                    <td>{f.desc_carburante} {f.is_self ? "(self)" : null}</td>
                                    <td className="fw-bold text-end">{f.prezzo.toFixed(3)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>


                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        <button id={'confronta'} className="btn btn-outline-primary btn-sm"
                                onClick={() => confrontaVicini()}>
                            Confronta Vicini
                        </button>
                        <a className="btn btn-primary btn-sm"
                           href={`https://www.google.com/maps/dir/?api=1&destination=${latitudine},${longitudine}`}
                           target="_blank" rel="noopener">
                            Vai con Google Maps
                        </a>
                    </div>


                </div>
                <div className={'col-lg-5 mb-4'}>
                    <div id={'mappa'} className="mb-3 rounded border">
                        <Map
                            mapLib={maplibregl}
                            initialViewState={{
                                longitude: longitudine,
                                latitude: latitudine,
                                zoom: 14,
                            }}
                            style={{width: '100%', height: '240px'}}
                            mapStyle={styleUrl}
                            attributionControl={false}

                            dragPan={!isMobile}             // ❌ disabilita pan con un dito
                            scrollZoom={!isMobile}          // ❌ disabilita zoom con scroll
                            doubleClickZoom={!isMobile}     // ❌ disabilita zoom con doppio tap
                            touchZoomRotate={true}      // ✅ abilita pinch-to-zoom e rotazione con due dita
                            interactive={true}          // ✅ mantiene la mappa attiva

                        >

                            <ImpiantoMarker d={impianto}/>

                            {showPopup ?
                                <Popup

                                    longitude={impianto.longitudine}
                                    latitude={impianto.latitudine}
                                    anchor="top"
                                    closeOnClick={false}
                                    onClose={() => setShowPopup(false)}>
                                    <ImpiantoPopup impianto={impianto}/></Popup> : null
                            }
                        </Map>
                    </div>
                    <div className={'mb-3'}>
                        <FavoriteToggle id={impianto.id_impianto}/>
                        <ShareButton impianto={impianto}/>
                    </div>


                </div>
                <ComparaVicini carburante={'benzina'}/>
            </div>
        </div>
    );
}
