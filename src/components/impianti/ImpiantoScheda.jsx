'use client';
import React, {useState} from 'react';
import Map, {Popup} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";
import ImpiantoPopup from "@/components/impianti/ImpiantoPopup";
import {isMobile} from "react-device-detect";
import ShareButton from "@/components/ShareButton";
import {logDebug, ucwords} from "@/functions/helpers";
import ImpiantoDescrizione from "@/components/impianti/ImpiantoDescrizione";
import {getElencoCarburanti} from "@/functions/api";
import Breadcrumb from "@/components/Breadcrumb";
import {getVectorTileLayer} from "@/functions/vector-tiles";
import slugify from 'slugify';
import Display5745053645 from "../ads/Display-5745053645";
import DirectionsIcon from "@mui/icons-material/Directions";
import {FooterMobile} from "@/components/FooterMobile";
import Button from "react-bootstrap/Button";
import {useRouter} from 'next/navigation';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import Link from "next/link";
import MapIcon from "@mui/icons-material/Map";
import Image from "next/image";
import {AdsDesktop} from "../ads/AdsDesktop";
import Display6977770298 from "@/components/ads/Display-6977770298";

export default function ImpiantoScheda({impianto, cookie}) {
    const [showPopup, setShowPopup] = useState(false);
    const styleUrl = getVectorTileLayer();//  'https://tiles.stadiamaps.com/styles/outdoors.json?api_key=9441d3ae-fe96-489a-8511-2b1a3a433d29';
    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;
    const router = useRouter();


    const {preferiti, gestisciClickCuore, ModalComponent, ModalResult} = usePreferitiGlobal();

    const isPreferito = () => {
        return preferiti.includes(impianto.id_impianto_pb);
    };

    const confrontaVicini = () => {
        logDebug('compare:open');
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

        logDebug(carburanti);
        const fuel = carburanti.find(c => c.tipo === cookie.carburante);
        logDebug(fuel);
        logDebug(prezzi);

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
        return {
            id: slugify(impianto.comune, {
                replacement: '-',  // sostituisce gli spazi con '-'
                lower: true,       // converte in minuscolo
                strict: true,      // rimuove caratteri speciali tranne il replacement
                locale: 'it'
            }), description: ucwords(impianto.comune)
        };
    }


    const recordOrdinati = [...prezzi].sort((a, b) => {
        if (a.fuel_id === b.fuel_id) {
            return b.is_self - a.is_self;
        }
        return a.fuel_id - b.fuel_id;
    })


    const BoxPrezzo = ({className}) => {
        return <div className={className}>
            <div className="card shadow border-0 rounded-3 mb-4 bg-white">
                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-primary fw-bold text-uppercase tracking-wider m-0">
                            {cookie.carburante}
                        </h5>
                    </div>

                    <div className="d-flex align-items-baseline">
                        <span className="h1 display-1 fw-bolder text-dark lh-1">{impianto.prezzo}</span>
                        <span className="fs-4 text-secondary ms-2 fw-normal">€/L</span>
                    </div>

                    <div className="d-flex align-items-center text-muted small">
                                <span className="bg-success rounded-circle d-inline-block me-2"
                                      style={{width: '8px', height: '8px'}}></span>
                        <span>Live Data - Aggiornato oggi</span>
                    </div>
                </div>
            </div>
        </div>;

    }

    return (
        <div className="container py-4">

            <AdsDesktop className={'mb-3'}>
                <Display6977770298/>
            </AdsDesktop>

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
                        <Image src={URI_IMAGE + impianto.image} alt={impianto.bandiera} width={96} height={96}/>
                        <div>
                            <h1 className="mb-0">{impianto.nome_impianto}</h1>
                            <small className="text-muted">{impianto.gestore}</small>
                        </div>
                    </div>
                    <BoxPrezzo className={'d-lg-none'}/>
                    <ImpiantoDescrizione impianto={impianto}/>

                    <h2 className={'h5'}>Indirizzo</h2>
                    <p>{indirizzo}{impianto.comune ? `, ${ucwords(impianto.comune)}` : null} {provincia ? `(${provincia})` : null}</p>
                    <div className={'mb-2'}>
                        <h2 className={'h5'}>Carburanti disponibili</h2>
                        <table className="table table-bordered align-middle table-light">
                            <thead className="h6 text-uppercase">
                            <tr>
                                <th scope="col">Tipo</th>
                                <th scope="col" width={50}>SELF</th>
                                <th scope="col" className={'text-end'} width={140}>Prezzo €/L</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recordOrdinati.map((f, i) => (
                                <tr key={i} className="">
                                    <td className={'bg-white'}>{f.desc_carburante} {f.is_self ? "(self)" : null}</td>
                                    <td className={'text-center text-warning bg-white'}>{f.is_self ?
                                        <StarIcon/> : null}</td>
                                    <td className="fw-bold text-end bg-white">{f.prezzo.toFixed(3)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <Display5745053645/>
                    </div>
                </div>
                <div className={'col-lg-5 mb-4'}>
                    <BoxPrezzo className={'d-none d-lg-block'}/>

                    <div id={'mappa'} className="mb-3 rounded border">
                        <Map
                            mapLib={maplibregl}
                            initialViewState={{
                                longitude: longitudine,
                                latitude: latitudine,
                                zoom: 14,
                            }}
                            style={{width: '100%', height: '360px'}}
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
                    <div className={'d-flex gap-2 mb-3'}>
                        <Button
                            variant={isPreferito() ? 'danger' : 'outline-danger'}
                            onClick={() => {
                                gestisciClickCuore(impianto);
                            }}
                            size={'sm'}> {isPreferito() ? <><FavoriteIcon/> Rimuovi</> : <>
                            <FavoriteBorderIcon/> Aggiungi</>} </Button>
                        <Link className="btn btn-primary btn-sm"
                              href={`https://www.google.com/maps/dir/?api=1&destination=${latitudine},${longitudine}`}
                              target="_blank" rel="noopener">
                            <MapIcon/> Vai
                        </Link>

                        <ShareButton impianto={impianto}/>
                    </div>

                    <Display5745053645/>


                </div>
            </div>
            <FooterMobile>
                <Button onClick={() => {
                    router.push(`https://www.google.com/maps/dir/?api=1&destination=${latitudine},${longitudine}`);
                }} variant={'success'} size={'lg'}><DirectionsIcon/> Portami qui</Button>


                <Button
                    onClick={() => {
                        gestisciClickCuore(impianto);
                    }}
                    size={'lg'} variant={'light'} className={'text-danger bg-white border-white'}>

                    {isPreferito() ? <FavoriteIcon/> :

                        <FavoriteBorderIcon/>}</Button>

            </FooterMobile>

            {ModalResult}
            {ModalComponent}

        </div>
    );
}
