import '../styles/custom.scss';
import Footer from "@/components/Footer";
import {Montserrat, Open_Sans} from 'next/font/google';


const montserrat = Montserrat({
    weight: "600"
})

const openSans = Open_Sans({
    weight: "400"
})

export const metadata = {
    title: 'PrezziBenzina.eu',
    description: 'Trova i distributori di carburante più convenienti vicino a te.',
    metadataBase: new URL('https://www.prezzibenzina.eu'),
};

export default function RootLayout({children}) {
    return (
        <html lang="it" className={montserrat.className + ' ' + openSans.className}>
        <head>
            <link rel="apple-touch-icon" href="/assets/logo-180.png" sizes="180x180"/>

        </head>
        <body>
        {children}
        <Footer/>
        </body>
        </html>
    );
}
