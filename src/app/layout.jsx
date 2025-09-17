import '../styles/custom.scss';
import Footer from "@/components/Footer";
import {Montserrat, Open_Sans} from 'next/font/google';
import Head from "next/head";


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
        {children}
        <Footer/>
        </body>
        </html>
    );
}
