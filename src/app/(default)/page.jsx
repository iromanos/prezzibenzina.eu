import SearchIcon from "@mui/icons-material/Search";
import {MapSection} from "@/components/home/MapSection";
import CTA from "@/components/home/CTA";
import "flag-icons/css/flag-icons.min.css";
import Descrizione from "@/components/home/Descrizione";
import Motivi from "@/components/home/Motivi";
import MapIcon from '@mui/icons-material/Map';
import {getCanonicalUrl, getOpenGraph, getTwitter} from "@/functions/server";
import {headers} from "next/headers";


export async function generateMetadata() {

    const title = 'PrezziBenzina.eu | Risparmia sul Carburante';
    const description = 'Trova i distributori più convenienti vicino a te. PrezziBenzina.eu ti guida con mappa interattiva e filtri intelligenti.';
    const imageUrl = '/assets/logo-og.png';
    const headerList = headers();

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
        openGraph: getOpenGraph(headerList, title, description, imageUrl),
        twitter: getTwitter(title, description, imageUrl),
    };
}


export default function Home() {
    return (
        <>
            {/* HERO */}
            <div
                className="container-fluid bg-primary bg-gradient text-white min-vh-100 d-flex align-items-center justify-content-center mb-4">
                <div className="text-center px-4">
                    <img src="/assets/logo-transparent.png" alt="Logo PrezziBenzina.eu" className="mb-4"
                         style={{maxWidth: '320px'}}/>
                    <h1 className="display-3 fw-bold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        Risparmia ogni giorno sul carburante.
                    </h1>
                    <p className="lead mb-4" style={{fontFamily: 'Open Sans, sans-serif'}}>
                        Prezzi aggiornati. Mappa interattiva. Distributori in Italia e Svizzera <span
                        className="fi fi-it"></span> <span className="fi fi-ch"></span>
                    </p>
                    <div className={'d-flex gap-3 justify-content-center align-items-center'}>
                        <a title={'Inizia la ricerca'} href="/ricerca" className="btn btn-light btn-lg shadow-sm">
                        <SearchIcon/> Inizia la ricerca
                    </a>
                        <a title={'Vai alla mappa di Italia e Svizzera'} href="#mappa"
                           className="btn btn-light btn-lg shadow-sm">
                            <MapIcon/> Vai alla mappa
                        </a>
                    </div>
                </div>
            </div>

            <div id='mappa' className={'container mb-4'}>


                <MapSection/>
            </div>
            <div className={'container mb-4'}>
                <Descrizione/>
            </div>
            <Motivi/>

            {/* COME FUNZIONA */}
            <div className="container py-5">
                <h2 className="text-center mb-5 fw-bold" style={{fontFamily: 'Montserrat, sans-serif'}}>Come
                    funziona</h2>
                <div className="row text-center">
                    {[
                        {
                            icon: '⛽',
                            title: 'Scegli il carburante',
                            text: 'Filtra per benzina, diesel, GPL, metano o elettrico.'
                        },
                        {
                            icon: '📍',
                            title: 'Inserisci la posizione',
                            text: 'Digita un indirizzo o usa la tua geolocalizzazione.'
                        },
                        {
                            icon: '💰',
                            title: 'Confronta e risparmia',
                            text: 'Visualizza i prezzi e scegli il distributore migliore.'
                        },
                    ].map((step, i) => (
                        <div className="col-md-4 mb-4" key={i}>
                            <div className="p-4 border rounded shadow-sm h-100 bg-light hover-shadow">
                                <div className="mb-2 fs-1">{step.icon}</div>
                                <h5 className="fw-bold">{step.title}</h5>
                                <p>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <CTA/>


        </>
    );
}
