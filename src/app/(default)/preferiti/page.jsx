import Header from "@/components/Header";
import React from "react";
import {FooterMobile} from "@/components/FooterMobile";
import {getCanonicalUrl} from "@/functions/server";
import {headers} from "next/headers";
import Preferiti from "../../../components/Preferiti";
import CookieBanner from "@/components/CookieBanner";


export async function generateMetadata() {

    const canonicalUrl = getCanonicalUrl(await headers()) + '/preferiti';

    return {
        title: 'Preferiti | PrezziBenzina.eu',
        description:
            'I miei distributori preferiti',
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'it': canonicalUrl,
                'x-default': canonicalUrl,
            },

        },
        robots: 'index, follow',
    };
}


export default function Page() {


    return <>
        <Header/>
        <main className="container py-3">
            <h1>Preferiti</h1>

            <Preferiti/>

            <FooterMobile added={<CookieBanner forMobile={true}/>}>

            </FooterMobile>
        </main>
    </>;
}
