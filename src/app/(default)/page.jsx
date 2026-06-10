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
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import PlaceIcon from '@mui/icons-material/Place';
import BoxComune from "../../components/home/BoxComune";

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
        openGraph: getOpenGraph(headerList, title, description, imageUrl),
        twitter: getTwitter(title, description, imageUrl),
    };
}

//TODO: inserire sotto la mappa, elenco dei principali comuni italiani

export default function Home() {
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
                    <div className={'d-flex gap-3 justify-content-center align-items-center flex-wrap'}>
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
                    <h2 className="fw-bold text-uppercase h5">Prezzo della benzina nei capoluoghi</h2>
                    <p className="text-muted">Seleziona la tua città per vedere i distributori più convenienti</p>
                </div>

                <div className="row g-4">
                    <BoxComune comune={'Milano'} fuel={'1-x'}/>
                    <BoxComune comune={'Roma'} fuel={'1-x'}/>
                    <BoxComune comune={'Napoli'} fuel={'1-x'}/>
                    <BoxComune comune={'Bologna'} fuel={'1-x'}/>
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
                                <h5 className="fw-bold">{step.title}</h5>
                                <p>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CTA/>

            <div className={'container mb-4'}>
                <Display6977770298/>
            </div>

            <FooterMobile>
                <FooterHome/>
            </FooterMobile>

        </>
    );
}
