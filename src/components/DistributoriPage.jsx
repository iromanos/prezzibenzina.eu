import Header from "@/components/Header";
import SezioneTitolo from "@/components/SezioneTitolo";
import {getDistributoriRegione} from "@/functions/api";
import {getSeoRegione} from "@/functions/api";
import React from "react";
import SezioneComuni from "@/components/SezioneComuni";
import ElencoDistributori from "@/components/ElencoDistributori";
import FiltroCarburante from "@/components/FiltroCarburante";
import FiltroMarchio from "@/components/FiltroMarchio";
import MappaWrapper from "@/components/MappaWrapper";

export default async function DistributoriPage({params}) {

    const {regione, carburante, marchio} = params;

    const distributori = await getDistributoriRegione(regione, carburante, marchio);
    const riepilogo = await getSeoRegione(regione, carburante);

    const comuni = [...new Set(riepilogo.comuni.map((d) => d.nome))];
    const carburanti = ['benzina', 'diesel', 'gpl', 'metano'];

    const marchi = [...new Set(riepilogo.marchi.map((d) => d.marchio))].filter(Boolean);


    function Mappa({distributori}){
        return <section className={"mb-4"}>
            <h2 className="h5 mb-3">Mappa dei distributori</h2>
            <MappaWrapper distributori={distributori}/>
        </section>;
    }


    return <>

        <Header/>

        <div className="container py-5">
            <SezioneTitolo regione={regione} carburante={carburante} marchio={marchio}/>

            <form method={'post'} action={'/api/pb'}>
                <input type={'hidden'} name={'regione'} value={regione} />
                <SezioneComuni comuni={comuni} regione={regione} />

                {/*<SeoTextRegione data={riepilogo}/>*/}

                <div className={'row'}>
                    <div className={'col-md-5'}>
                        <ElencoDistributori Regione={regione} distributori={distributori} />
                    </div>
                    <div className={'col-md-7'}>
                        <FiltroCarburante regione={regione} carburanti={carburanti} selezionato={carburante} />
                        <FiltroMarchio regione={regione} carburante={carburante} marchi={marchi} selezionato={marchio} />
                        <div className={'mb-4'}>
                            <button type={'submit'} className={'btn btn-sm btn-primary'} >Filtra</button>
                        </div>
                        <Mappa distributori={distributori} /></div>
                </div>

            </form>



        </div>



    </>;


}