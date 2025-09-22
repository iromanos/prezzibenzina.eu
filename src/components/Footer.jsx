export default function Footer() {
    return (
        <footer className="bg-dark text-white mt-auto py-4">
            <div className="container">
                <div className="row align-items-start">
                    {/* Logo e descrizione */}
                    <div className="col-md-4 mb-3 text-center text-md-start">
                        <a href={'/'} title={'Prezzibenzina.eu'}>
                        <img

                            width={120}
                            height={120}

                            src="/assets/logo-transparent-120.png" alt="Logo PrezziBenzina.eu" className="mb-2"/></a>
                        <p className="small mb-0">
                            PrezziBenzina.eu ti aiuta a trovare i distributori più convenienti nella tua zona. Risparmia ogni giorno.
                        </p>
                    </div>

                    {/* Link utili */}
                    <div className="col-md-4 mb-3 text-center">
                        <span className="fw-bold h6">Navigazione</span>
                        <ul className="list-unstyled">
                            <li><a title={"Ricerca"} href="/ricerca"
                                   className="text-white text-decoration-none">Ricerca</a></li>
                            <li><a title={"Mappa"} href="/mappa"
                                   className="text-white text-decoration-none">Mappa</a></li>
                            <li><a title={"Contatti"} href="/contatti"
                                   className="text-white text-decoration-none">Contatti</a></li>
                        </ul>
                    </div>

                    {/* Info legali */}
                    <div className="col-md-4 mb-3 text-center text-md-end">
                        <span className="fw-bold h6">Informazioni</span>
                        <ul className="list-unstyled">
                            <li><a title={"Privacy"} href="/privacy"
                                   className="text-white text-decoration-none">Privacy</a></li>
                            <li><a title={"cookie"} href="/cookie"
                                   className="text-white text-decoration-none">Cookie</a></li>
                        </ul>
                    </div>
                </div>

                <hr className="border-light" />
                <div className="text-center small">
                    © {new Date().getFullYear()} PrezziBenzina.eu — Tutti i diritti riservati
                </div>
            </div>
        </footer>
    );
}
