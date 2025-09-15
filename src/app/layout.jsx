
import '../styles/custom.scss';
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata = {
  title: 'PrezziBenzina.eu',
  description: 'Trova i distributori di carburante più convenienti vicino a te.',
    metadataBase: new URL('https://www.prezzibenzina.eu'),
};

export default function RootLayout({ children }) {
  return (
      <html lang="it">
      <head>

          <link
              href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&family=Montserrat:wght@600&display=swap"
              rel="stylesheet"/>

          <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </head>
      <body>
        {children}
        <Footer />
      </body>
      </html>
  );
}
