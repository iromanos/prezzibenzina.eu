import '../styles/custom.scss';
import {Montserrat, Quicksand} from 'next/font/google';
import Head from "next/head";
import {CookieConsentProvider} from "@/components/CookieConsentContext";
import Analytics from "@/components/Analytics";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";
import {headers} from "next/headers";
import Script from "next/script";
import CookieBanner from "@/components/CookieBanner";


const montserrat = Montserrat({
    weight: "800",
    display: 'swap',
})

const openSans = Quicksand({
    weight: "400",
    display: 'swap',
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
        <html lang="it" className={montserrat.className + ' ' + openSans.className}>
        <Head>


            <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"/>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
            <link rel="shortcut icon" href="/favicon.ico"/>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="manifest" href="/site.webmanifest"/>

        </Head>

        {/*{isFuel === false && <Cmp />}*/}

        {isFuel && <Script
            strategy="afterInteractive"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7775238513283854"
            crossOrigin="anonymous"></Script>}

        <body>
        <AppRouterCacheProvider>
            <CookieConsentProvider>
                {children}
                {isFuel === false && <CookieBanner/>}
                <Analytics trackId={trackId}/>
            </CookieConsentProvider>
        </AppRouterCacheProvider>
        </body>
        </html>
    );
}
