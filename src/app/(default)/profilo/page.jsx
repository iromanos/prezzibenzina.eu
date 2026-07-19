import ProfiloClient from '@/components/profilo/ProfiloClient';
import Header from "@/components/Header.jsx";

export default async function ProfiloPage() {

    return (
        <>
            <Header/>
            <main className="container my-4">
                <ProfiloClient/>
            </main>
        </>
    );
}