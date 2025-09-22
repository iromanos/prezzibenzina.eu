import Footer from '@/components/Footer';

export default function DefaultLayout({children}) {
    return (
        <>
            {children}
            <Footer/>
        </>
    );
}
