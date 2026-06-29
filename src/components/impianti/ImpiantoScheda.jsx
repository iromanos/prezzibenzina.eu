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
import StoricoPrezzi from "./StoricoPrezzi";

//TODO: inserire la media dei prezzi del comune / provincia ed indicare il risparmio


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

        // logDebug(carburanti);
        const fuel = carburanti.find(c => c.tipo === cookie.carburante);
        logDebug(prezzi);

        // console.log("PREZZI", prezzi);

        let qry = prezzi
            .filter(p => p.fuel_id === fuel.fuel_id);

        if (fuel.fuel_id === 1 || fuel.fuel_id === 2) {
            qry = qry.filter(p => p.is_self === 1);
        }
        try {
            const prezzo = qry[0];
            if (prezzo === undefined) {
                if (prezzi.length !== 0) {
                    return prezzi[0];
                } else return null;
            }
            return prezzo;
        } catch (e) {

        }
        return null;
    }

    const carburante = prezzo();

    impianto.prezzo = carburante !== null ? carburante.prezzo : 0;
    const descrizioneCarburante = carburante !== null ? carburante.desc_carburante : '';
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
                        <span className="h5 text-primary fw-bold text-uppercase tracking-wider m-0">
                            {descrizioneCarburante}
                        </span>
                    </div>

                    <div className="d-flex align-items-baseline">
                        <span className="h1 display-1 fw-bolder text-dark lh-1">{impianto.prezzo.toFixed(3)}</span>
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

    function DescrizioneImpianto({data, nomeImpianto, comune}) {

        const {services} = data;

        // Se non ci sono servizi, restituisce un testo di fallback standard
        if (!services || services.length === 0) {
            return (
                <div className="seo-description-box my-3 p-4 bg-light rounded border">
                    <p className="text-muted lh-base fs-6 mb-0">
                        La stazione di servizio <strong>{nomeImpianto}</strong> si trova a <strong>{comune}</strong> ed
                        è pronta a offrirti carburante di qualità per il tuo veicolo. Passa a trovarci per scoprire le
                        tariffe aggiornate di benzina, diesel e GPL e fare rifornimento in totale comodità sul
                        territorio comunale.
                    </p>
                </div>
            );
        }

        const listaServizi = services.map(s => s.description);

        const haCamper = listaServizi.includes('Sosta Camper/Tir') || listaServizi.includes('Scarico per camper');
        const haAuto = listaServizi.includes('Autolavaggio') || listaServizi.includes('Officina') || listaServizi.includes('Gommista');
        const haRistoro = listaServizi.includes('Food&Beverage') || listaServizi.includes('Wi-Fi');
        const haElettrico = listaServizi.includes('Colonnina ricarica elettrica');

        // PARAGRAFO 1: Introduzione e contesto locale
        const paragrafo1 = <>Il distributore <strong>{nomeImpianto}</strong> a <strong>{comune}</strong> non è una
            semplice stazione di rifornimento carburante, ma un vero e proprio punto di riferimento per gli
            automobilisti della zona. Presso questo impianto potrai usufruire di numerosi comfort studiati appositamente
            per ottimizzare la tua sosta e viaggiare in totale sicurezza.</>;

        // PARAGRAFO 2: Dinamico sui servizi dell'impianto con tag strong
        const renderParagrafo2 = () => {
            let elementi = [];

            if (haRistoro) {
                elementi.push(
                    <span key="ristoro">
          Per una pausa rigenerante, la struttura offre un'area {listaServizi.includes('Food&Beverage') ?
                        <strong>Food & Beverage</strong> : 'ristoro'}
                        {listaServizi.includes('Wi-Fi') ? <> dotata di
                            connessione <strong>Wi-Fi</strong> gratuita</> : ''}, ideale per rilassarsi prima di rimettersi in viaggio.{' '}
        </span>
                );
            }

            if (haAuto) {
                // Creiamo la stringa con i tag strong per i servizi auto presenti
                const serviziAutoPresenti = [];
                if (listaServizi.includes('Autolavaggio')) serviziAutoPresenti.push(<strong
                    key="lav">autolavaggio</strong>);
                if (listaServizi.includes('Officina')) serviziAutoPresenti.push(<strong key="off">officina</strong>);
                if (listaServizi.includes('Gommista')) serviziAutoPresenti.push(<strong key="gom">gommista</strong>);

                elementi.push(
                    <span key="auto">
          Chi desidera prendersi cura del proprio veicolo troverà servizi dedicati tra cui{' '}
                        {serviziAutoPresenti.reduce((prev, curr, i) => [prev, i === serviziAutoPresenti.length - 1 ? ' e ' : ', ', curr])}.{' '}
        </span>
                );
            }

            if (haCamper) {
                elementi.push(
                    <span key="camper">
          L'impianto è perfettamente attrezzato anche per i viaggiatori itineranti, offrendo spazi per la <strong>sosta di camper o TIR</strong> e comodi sistemi di <strong>scarico per camper</strong> dedicati.{' '}
        </span>
                );
            }

            if (haElettrico) {
                elementi.push(
                    <span key="elettrico">
          In ottica di mobilità sostenibile, è presente una moderna <strong>colonnina per la ricarica elettrica</strong> veloce.{' '}
        </span>
                );
            }

            if (elementi.length === 0) {
                return "La stazione mette a disposizione una selezione di servizi accessori pensati per soddisfare ogni esigenza logistica ed estendere l'assistenza oltre il semplice rifornimento.";
            }

            return elementi;
        };

        // PARAGRAFO 3: Chiusura su accessibilità e pagamenti con tag strong
        const paragrafo3 = <>La stazione garantisce infine la massima accessibilità a tutti i clienti grazie ai <strong>servizi
            per disabili</strong> e alla presenza di un'<strong>area bambini</strong>. Per quanto riguarda le modalità
            di pagamento, è possibile effettuare transazioni rapide e sicure tramite <strong>Bancomat</strong> e carte
            direttamente alla colonnina self-service o presso la cassa presidiata.</>;

        return (
            <div className="seo-description-box my-3 p-4 bg-light rounded border">
                {/* Primo Paragrafo */}
                <p className="lh-base mb-3 fs-6">
                    {paragrafo1}
                </p>

                {/* Secondo Paragrafo (Dinamico) */}
                <p className="lh-base mb-3 fs-6">
                    {renderParagrafo2()}
                </p>

                {/* Terzo Paragrafo */}
                <p className="lh-base mb-3 fs-6">
                    {paragrafo3}
                </p>

                {/* Badge visivi dei servizi */}
                <div className="d-flex flex-wrap gap-2 mt-3">
                    {services.map((service) => (
                        <span
                            key={service.id}
                            className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1.5 fw-normal"
                        >
            {service.description}
          </span>
                    ))}
                </div>
            </div>
        );
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

                    <ImpiantoDescrizione impianto={impianto} carburante={descrizioneCarburante.toLowerCase()}/>

                    <h2 className={'h5'}>Indirizzo</h2>
                    <p>{indirizzo}{impianto.comune ? `, ${ucwords(impianto.comune)}` : null} {provincia ? `(${provincia})` : null}</p>


                    <div className={'mb-2'}>
                        {carburante && <>
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
                        </>}
                        <Display5745053645/>
                    </div>
                    {impianto.servizi &&
                        <DescrizioneImpianto nomeImpianto={nome_impianto} comune={impianto.comune}
                                             data={impianto.servizi}/>
                    }
                    {impianto.servizi && impianto.servizi.services.length !== 0 && <>
                        <h2 className={'h5'}>Servizi disponibili</h2>
                        <p>In questa stazione di servizio sono attivi i seguenti servizi per la clientela:</p>
                        <ul>
                            {impianto.servizi.services.map(s => {
                                return <li key={s.id}>{s.description}</li>
                            })}</ul>
                    </>}

                </div>
                <div className={'col-lg-5 mb-4'}>
                    {carburante &&
                        <BoxPrezzo className={'d-none d-lg-block'}/>}


                    {/* CARD CONTENITORE DENTRO LA TUA PAGINA */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="h6 card-title text-secondary mb-0 fw-normal">
                                    Andamento Storico Prezzi
                                </h2>
                                <span className="badge bg-light text-dark border">Aggiornato oggi</span>
                            </div>

                            <StoricoPrezzi impiantoId={impianto.id_impianto}/>

                        </div>
                    </div>
                    <Display5745053645/>

                    <div id={'mappa'} className="mb-3 rounded border">
                        <Map
                            mapLib={maplibregl}
                            initialViewState={{
                                longitude: longitudine,
                                latitude: latitudine,
                                zoom: 11,
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
