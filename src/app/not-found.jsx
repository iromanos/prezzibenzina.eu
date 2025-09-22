import Link from 'next/link';
import Header from "@/components/Header";

export default function NotFound() {
    return (
        <><Header/>
            <div style={{textAlign: 'center', padding: '4rem'}}>
                <h1>404 - Pagina non trovata</h1>
                <p>La pagina che cerchi non esiste o è stata rimossa.</p>
                <Link href="/" title={"Home"}>
                    Torna alla home
                </Link>
            </div>
        </>
    );
}
