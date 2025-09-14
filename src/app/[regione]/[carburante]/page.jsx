import Link from 'next/link';
import MappaWrapper from "@/components/MappaWrapper";
import axios from "axios";
import Header from "@/components/Header";
import SeoTextRegione from "@/components/SeoTextRegione";
import FiltroMarchio from "@/components/FiltroMarchio";
import React from "react";
import FiltroCarburante from "@/components/FiltroCarburante";
import ElencoDistributori from "@/components/ElencoDistributori";
import SezioneTitolo from "@/components/SezioneTitolo";
import {getDistributoriRegione} from "@/functions/api";
import {getSeoRegione} from "@/functions/api";
import SezioneComuni from "@/components/SezioneComuni";

export async function generateMetadata({params}) {
    const {regione} = params;
    const Regione = regione.charAt(0).toUpperCase() + regione.slice(1);

    return {
        title: `Prezzi carburante in ${Regione} | Distributori attivi`,
        description: `Consulta i prezzi aggiornati dei carburanti in ${Regione}. Trova i distributori più convenienti e naviga per città e tipo di carburante.`,
        keywords: [`prezzi carburante ${regione}`, `distributori ${regione}`, `benzina ${regione}`, `diesel ${regione}`],
    };
}





function Mappa({distributori}){
    return <section className={"mb-4"}>
        <h2 className="h5 mb-3">Mappa dei distributori</h2>
        <MappaWrapper distributori={distributori}/>
    </section>;
}

export default async function RegionePage({params, searchParams}) {
    const {regione, carburante} = params;
    const marchioSelezionato = searchParams?.marchio || null;

    const Regione = decodeURIComponent(regione.charAt(0).toUpperCase() + regione.slice(1));

    const distributori = await getDistributoriRegione(regione, carburante, marchioSelezionato);
    const riepilogo = await getSeoRegione(regione, carburante);

    const comuni = [...new Set(riepilogo.comuni.map((d) => d.nome))];
    const carburanti = ['benzina', 'diesel', 'gpl', 'metano'];

    const marchi = [...new Set(riepilogo.marchi.map((d) => d.marchio))].filter(Boolean);

    return (<>
            <Header/>
            <div className="container py-5">

                <SezioneTitolo regione={regione} carburante={carburante} />
                <form method={'post'} action={'/api/pb'}>
                    <input type={'hidden'} name={'regione'} value={regione} />
                <SezioneComuni comuni={comuni} regione={regione} />

                {/*<SeoTextRegione data={riepilogo}/>*/}

                <div className={'row'}>
                    <div className={'col-md-5'}>
                        <ElencoDistributori Regione={Regione} distributori={distributori} />
                    </div>
                    <div className={'col-md-7'}>
                        <FiltroCarburante regione={regione} carburanti={carburanti} selezionato={carburante} />
                        <FiltroMarchio regione={regione} carburante={carburante} marchi={marchi} selezionato={marchioSelezionato} />
                        <div className={'mb-4'}>
                            <button type={'submit'} className={'btn btn-sm btn-primary'} >Filtra</button>
                        </div>
                        <Mappa distributori={distributori} /></div>
                </div>
                </form>
            </div>
        </>
    );
}
