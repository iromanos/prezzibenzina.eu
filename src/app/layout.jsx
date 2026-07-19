import '../styles/custom.scss';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Inter, Montserrat} from 'next/font/google';
import Head from "next/head";
import {CookieConsentProvider} from "@/components/CookieConsentContext";
import Analytics from "@/components/Analytics";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";
import {cookies, headers} from "next/headers";
import {PreferitiProvider} from "@/context/PreferitiProvider";
import LoadAdSense from "../components/ads/LoadAdSense";
import CookieBanner from "@/components/CookieBanner";
import {AuthProvider} from '@/contexts/AuthContext';
import jwt from 'jsonwebtoken';

const montserrat = Montserrat({
    weight: "800",
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-header',
});

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-base',
});

export const metadata = {
    title: 'PrezziBenzina.eu',
    description: 'Trova i distributori di carburante più convenienti vicino a te.',
    metadataBase: new URL('https://www.prezzibenzina.eu'),
};

export default async function RootLayout({children}) {

    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    let user = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
            user = decoded
            console.log("Utente autenticato:", decoded);
        } catch (error) {
            console.error("Token non valido o scaduto:", error.message);
        }
    }

    const headersList = await headers();
    const referer = headersList.get('X-WEFUEL-REFERER');
    const isFuel = (referer === "wefuel");
    let trackId = "G-Q603H5VH66";

    if (isFuel) {
        trackId = "G-VNEDGKF1LT";
    }

    return (
        <html lang="it" className={`${montserrat.variable} ${inter.variable}`}>
        <Head>
            <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"/>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
            <link rel="shortcut icon" href="/favicon.ico"/>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
        </Head>

        <body>
        <AuthProvider appToken={token} initialUser={user}>
            <AppRouterCacheProvider>
                <PreferitiProvider>
                    <CookieConsentProvider>
                        <Analytics trackId={trackId}/>
                        {children}
                        {isFuel === false && <CookieBanner/>}
                    </CookieConsentProvider>
                </PreferitiProvider>
            </AppRouterCacheProvider>
        </AuthProvider>
        <LoadAdSense/>
        </body>
        </html>
    );
}