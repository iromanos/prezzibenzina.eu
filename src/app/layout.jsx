import '../styles/custom.scss';
import {Montserrat, Open_Sans} from 'next/font/google';
import Head from "next/head";
import {CookieConsentProvider} from "@/components/CookieConsentContext";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import Adsense from "@/components/Adsense";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";


const montserrat = Montserrat({
    weight: "600",
    display: 'swap',
})

const openSans = Open_Sans({
    weight: "400",
    display: 'swap',
})

export const metadata = {
    title: 'PrezziBenzina.eu',
    description: 'Trova i distributori di carburante più convenienti vicino a te.',
    metadataBase: new URL('https://www.prezzibenzina.eu'),
};

export default function RootLayout({children}) {
    return (
        <html lang="it" className={montserrat.className + ' ' + openSans.className}>
        <Head>

            <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"/>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
            <link rel="shortcut icon" href="/favicon.ico"/>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="manifest" href="/site.webmanifest"/>

        </Head>
        <body>
        <AppRouterCacheProvider>
        <CookieConsentProvider>
            {children}
            <CookieBanner/>
            <Adsense/>
            <Analytics/>
        </CookieConsentProvider>
        </AppRouterCacheProvider>
        </body>
        </html>
    );
}
