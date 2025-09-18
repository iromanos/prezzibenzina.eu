// app/impianto/[slug]/page.jsx
import ImpiantoScheda from '@/components/impianti/ImpiantoScheda';
import {getImpianto} from "@/functions/api";
import {log} from "@/functions/helpers";
import Header from "@/components/Header";

export async function generateMetadata({params}) {
    const res = await getImpianto({params});
    const impianto = await res.json();

    return {
        title: `${impianto.nome_impianto} – ${impianto.comune} | PrezziBenzina.eu`,
        description: `Prezzi aggiornati per ${impianto.nome_impianto} a ${impianto.comune}. Consulta mappa, orari, carburanti e confronta con i vicini.`,
    };
}

export default async function Page({params}) {

    const res = await getImpianto({params});

    const impianto = await res.json();

    log(impianto);


    return <><Header/>
        <ImpiantoScheda impianto={impianto}/></>;
}
