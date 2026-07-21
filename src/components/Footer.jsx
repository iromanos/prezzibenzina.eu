import Image from "next/image";
import Link from "next/link"; // Importa Link da next/link

export default function Footer() {
    return (
        <footer className="bg-dark text-white mt-auto py-4">
            <div className="container">
                <div className="row align-items-start">
                    {/* Logo e descrizione */}
                    <div className="col-md-4 mb-3 text-center text-md-start">
                        <Link href={'/'} title={'Prezzibenzina.eu'}>
                            <Image
                            width={120}
                            height={120}
                            src="/assets/logo-transparent-120.png" alt="Logo PrezziBenzina.eu" className="mb-2"/></Link>
                        {/*<p className="small mb-0">*/}
                        {/*    PrezziBenzina.eu ti aiuta a trovare i distributori più convenienti nella tua zona. Risparmia ogni giorno.*/}
                        {/*</p>*/}
                    </div>

                    {/* Link utili */}
                    <div className="col-md-4 mb-3 text-center">
                        <span className="fw-bold h6">Navigazione</span>
                        <ul className="list-unstyled">
                            <li><Link title={"Ricerca"} href="/ricerca"
                                      className="text-white text-decoration-none">Ricerca</Link></li>
                            <li><Link title={"Mappa"} href="/mappa"
                                      className="text-white text-decoration-none">Mappa</Link></li>
                            <li><Link title={"Statistiche"} href="/statistiche"
                                      className="text-white text-decoration-none">Statistiche</Link></li>
                            {/* Nuovo link per Prezzi Medi Regione */}
                            <li><Link title={"Prezzi Medi Carburante per Regione"} href="/prezzi-medi-regione"
                                      className="text-white text-decoration-none">Prezzi Medi Regione</Link></li>
                            <li><Link title={"Contatti"} href="/contatti"
                                      className="text-white text-decoration-none">Contatti</Link></li>
                        </ul>
                    </div>

                    {/* Info legali */}
                    <div className="col-md-4 mb-3 text-center text-md-end">
                        <span className="fw-bold h6">Informazioni</span>
                        <ul className="list-unstyled">
                            <li><Link title={"Privacy"} href="/privacy"
                                      className="text-white text-decoration-none">Privacy</Link></li>
                            <li><Link title={"cookie"} href="/cookie"
                                      className="text-white text-decoration-none">Cookie</Link></li>
                        </ul>
                    </div>
                </div>

                <hr className="border-light" />
                <div className="text-center small">
                    © {new Date().getFullYear()} PrezziBenzina.eu — Tutti i diritti riservati <br/>
                    Alessandro Romano - Codice Fiscale: RNNLSN73R10F205Z
                </div>
            </div>
        </footer>
    );
}