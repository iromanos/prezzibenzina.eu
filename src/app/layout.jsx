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
            <link rel="apple-touch-icon" href="/assets/logo-180.png" sizes="180x180"/>
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
