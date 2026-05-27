import '../styles/custom.scss';
import {Montserrat, Quicksand} from 'next/font/google';
import Head from "next/head";
import {CookieConsentProvider} from "@/components/CookieConsentContext";
import Analytics from "@/components/Analytics";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";
import {headers} from "next/headers";
import {PreferitiProvider} from "@/context/PreferitiProvider";
import LoadAdSense from "../components/ads/LoadAdSense";
import CookieBanner from "@/components/CookieBanner";


const montserrat = Montserrat({
    weight: "800",
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-montserrat',
})

const quicksand = Quicksand({
    weight: "400",
    subsets: ['latin'], // <-- Importante
    display: 'swap',
    variable: '--font-quicksand', // <-- Definisci la variabile CSS
})

export const metadata = {
    title: 'PrezziBenzina.eu',
    description: 'Trova i distributori di carburante più convenienti vicino a te.',
    metadataBase: new URL('https://www.prezzibenzina.eu'),
};

export default async function RootLayout({children}) {

    const headersList = await headers();

    const referer = headersList.get('X-WEFUEL-REFERER');

    const isFuel = (referer === "wefuel");

    let trackId = "G-Q603H5VH66";

    if (isFuel) {
        trackId = "G-VNEDGKF1LT";
    }

    console.log("REFERER: " + referer);

    return (
        <html lang="it" className={`${montserrat.variable} ${quicksand.variable}`}>
        <Head>


            <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"/>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
            <link rel="shortcut icon" href="/favicon.ico"/>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="manifest" href="/site.webmanifest"/>

        </Head>

        <body>
        <AppRouterCacheProvider>
            <PreferitiProvider>
                <CookieConsentProvider>
                    <Analytics trackId={trackId}/>
                    {children}
                    {isFuel === false && <CookieBanner/>}
                </CookieConsentProvider>
            </PreferitiProvider>
        </AppRouterCacheProvider>


        {process.env.NODE_ENV === 'production' &&
            <LoadAdSense/>
        }
        </body>
        </html>
    );
}
