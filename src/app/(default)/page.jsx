import SearchIcon from "@mui/icons-material/Search";
import CTA from "@/components/home/CTA";
import "flag-icons/css/flag-icons.min.css";
import Descrizione from "@/components/home/Descrizione";
import Motivi from "@/components/home/Motivi";
import MapIcon from '@mui/icons-material/Map';
import {getCanonicalUrl, getOpenGraph, getTwitter} from "@/functions/server";
import {headers} from "next/headers";
import Display6977770298 from "../../components/ads/Display-6977770298";
import {FooterMobile} from "@/components/FooterMobile";
import FooterHome from "../../components/home/FooterHome";
import Header from "@/components/Header";
import {MapSection} from "@/components/home/MapSection";
import SavingsIcon from '@mui/icons-material/Savings';
import PlaceIcon from '@mui/icons-material/Place';

import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'; // Benzina/Metano
import LocalActivityIcon from '@mui/icons-material/LocalActivity'; // Autolavaggio
import EvStationIcon from '@mui/icons-material/EvStation'; // Elettrica
import CoffeeIcon from '@mui/icons-material/Coffee'; // Area Ristoro
import SettingsIcon from '@mui/icons-material/Settings'; // Officina/Gommista
import BoxComune from "../../components/home/BoxComune";
import {AdsDesktop} from "@/components/ads/AdsDesktop";
import {getCapoluoghi, getServizi} from "@/functions/api";

export async function generateMetadata() {

    const title = 'PrezziBenzina.eu | Risparmia sul Carburante';
    const description = 'Trova i distributori più convenienti vicino a te. PrezziBenzina.eu ti guida con mappa interattiva e filtri intelligenti.';
    const imageUrl = '/assets/logo-og.png';
    const headerList = await headers();

    const canonicalUrl = getCanonicalUrl(headerList);

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'it': canonicalUrl,
                'x-default': canonicalUrl,
            },
        },
        openGraph: getOpenGraph(canonicalUrl, title, description, imageUrl),
        twitter: getTwitter(title, description, imageUrl),
    };
}

/**
 * Mappatura icone per i servizi caricati da API
 */
const SERVICE_ICON_MAP = {
    'autolavaggio': <LocalActivityIcon/>,
    'metano': <LocalGasStationIcon/>,
    'gpl': <LocalGasStationIcon/>,
    'colonnina-ricarica-elettrica': <EvStationIcon/>,
    'area-ristoro': <CoffeeIcon/>,
    'officina': <SettingsIcon/>,
    'gommista': <SettingsIcon/>,
};

export default async function Home() {
    // Carichiamo i dati dalle API in parallelo
    const [serviziRaw, capoluoghi] = await Promise.all([
        getServizi(),
        getCapoluoghi()
    ]);

    // Selezioniamo solo i primi 4 servizi che hanno una mappatura icona per la vetrina in Home
    const serviziInEvidenza = serviziRaw
        ?.filter(s => SERVICE_ICON_MAP[s.slug])
        ?.slice(0, 4) || [];

    return (
        <>
            <Header/>
            <div
                className="container-fluid bg-primary text-white min-vh-50 d-flex align-items-center justify-content-center mb-4 py-4">
                <div className="text-center px-md-4">
                    <h1 className="display-5 fw-bold">
                        Risparmia ogni giorno sul carburante.
                    </h1>
                    <p className="lead mb-4">
                        Prezzi aggiornati. Mappa interattiva. Distributori in Italia e Svizzera <span
                        className="fi fi-it"></span> <span className="fi fi-ch"></span>
                    </p>
                    <div className={'d-lg-none d-flex gap-3 justify-content-center align-items-center flex-wrap'}>
                        <a title={'Inizia la ricerca'} href="/ricerca" className="btn btn-light shadow-sm">
                            <SearchIcon/> Inizia la ricerca
                        </a>
                        <a title={'Vai alla mappa di Italia e Svizzera'} href="#mappa"
                           className="btn btn-light shadow-sm">
                            <MapIcon/> Vai alla mappa
                        </a>
                    </div>
                </div>
            </div>

            <AdsDesktop className={'container mb-4'}>
                <Display6977770298/>
            </AdsDesktop>
            <div id='mappa' className={'container mb-4'}>
                <MapSection/>
            </div>
            <div className={'container mb-4'}>
                <div className={'d-flex gap-4 flex-wrap'}>
                    <div className={'card col-lg-7 bg-white'}>
                        <div className={'card-body'}>
                            <Descrizione/>
                        </div>
                    </div>
                    <div className={'card col bg-white'}>
                        <div className={'card-body'}>
                            <Motivi/>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container my-5">
                <div className="text-center mb-4">
                    <h3 className="fw-bold text-uppercase h5">Prezzo della benzina nei capoluoghi</h3>
                    <p className="text-muted">Seleziona la tua città per vedere i distributori più convenienti</p>
                </div>

                <div className="row g-4">
                    {capoluoghi?.slice(0, 4).map((c) => (
                        <BoxComune key={c.id} comune={c.description} fuel={'1-x'}/>
                    ))}
                </div>
            </div>

            {/* Nuova Sezione: Servizi nei Capoluoghi */}
            <div className="container my-5">
                <div className="text-center mb-4">
                    <h3 className="fw-bold text-uppercase h5">Servizi per il tuo viaggio</h3>
                    <p className="text-muted">Trova distributori attrezzati nelle principali città</p>
                </div>

                <div className="row g-3">
                    {serviziInEvidenza.map((servizio, i) => (
                        <div className="col-6 col-md-3" key={i}>
                            <a
                                href={`/distributori/${servizio.slug}/${(capoluoghi?.[i]?.description || 'Milano').toLowerCase()}`}
                                className="card h-100 border-0 shadow-sm text-decoration-none pb-service-card transition-all"
                                style={{backgroundColor: '#f8f9fa'}}
                            >
                                <div className="card-body text-center p-3">
                                    <div className="text-primary mb-2" style={{fontSize: '2rem'}}>
                                        {SERVICE_ICON_MAP[servizio.slug] || <LocalGasStationIcon/>}
                                    </div>
                                    <h4 className="h6 fw-bold text-dark mb-1">{servizio.description}</h4>
                                    <p className="small text-muted mb-0">a {capoluoghi?.[i]?.description || 'Milano'}</p>
                                </div>
                            </a>
                        </div>
                    ))}
                    <div className="col-12 text-center mt-3">
                        <a href="/ricerca" className="btn btn-outline-primary btn-sm rounded-pill px-4">Scopri tutti i
                            servizi</a>
                    </div>
                </div>
            </div>


            <div className={'container mb-4'}>
                <Display6977770298/>
            </div>

            <div className="container py-2">
                <h2 className="text-center mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>Come
                    funziona</h2>
                <div className="row text-center">
                    {[
                        {
                            icon: <LocalGasStationIcon fontSize={'inherit'}/>,
                            title: 'Scegli il carburante',
                            text: 'Filtra per benzina, diesel, GPL, metano o elettrico.'
                        },
                        {
                            icon: <PlaceIcon fontSize={'inherit'}/>,
                            title: 'Inserisci la posizione',
                            text: 'Digita un indirizzo o usa la tua geolocalizzazione.'
                        },
                        {
                            icon: <SavingsIcon fontSize={'inherit'}/>,
                            title: 'Confronta e risparmia',
                            text: 'Visualizza i prezzi e scegli il distributore migliore.'
                        },
                    ].map((step, i) => (
                        <div className="col-md-4 mb-4" key={i}>
                            <div className="p-4 border rounded shadow-sm h-100 bg-white hover-shadow">
                                <div className="mb-2 display-3">{step.icon}</div>
                                <h3 className="fw-bold">{step.title}</h3>
                                <p>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CTA/>

            <style>{`
                .pb-service-card {
                    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
                }
                .pb-service-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 14px 28px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.08) !important;
                    background-color: #ffffff !important;
                }
                .pb-service-card:hover .text-primary {
                    transform: scale(1.1);
                    transition: transform 0.3s ease;
                }
            `}</style>

            <div className={'container mb-4'}>
                <Display6977770298/>
            </div>

            <FooterMobile>
                <FooterHome/>
            </FooterMobile>

        </>
    );
}
