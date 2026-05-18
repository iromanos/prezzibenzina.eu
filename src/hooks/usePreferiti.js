import React, {useEffect, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {useRouter} from 'next/navigation';

export default function usePreferiti() {
    //TODO: non gestisce gli id che iniziano con "IT-" o "CH-"
    const router = useRouter();

    const [preferiti, setPreferiti] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [prodottoSelezionato, setProdottoSelezionato] = useState(null);

    // 1. Carica i preferiti dal LocalStorage all'avvio della pagina
    useEffect(() => {
        const preferitiSalvati = localStorage.getItem('bookmark');
        if (preferitiSalvati) {
            setPreferiti(JSON.parse(preferitiSalvati));
        }
    }, []);

    const gestisciClickCuore = (prodotto) => {
        const isPreferito = preferiti.includes(prodotto.id_impianto);
        setProdottoSelezionato(prodotto);
        if (isPreferito) {
            setShowModal(true);
        } else {
            eseguiToggle(prodotto.id_impianto);
        }
    };

    const eseguiToggle = (id) => {
        let nuoviPreferiti;
        let isNuovo = false;
        if (preferiti.includes(id)) {
            nuoviPreferiti = preferiti.filter(prefId => prefId !== id);
        } else {
            nuoviPreferiti = [...preferiti, id];
            isNuovo = true;
        }
        setPreferiti(nuoviPreferiti);
        localStorage.setItem('bookmark', JSON.stringify(nuoviPreferiti));

        setShowModal(false);
        if (isNuovo) {
            setShowResult(true);
        }
    };

    const chiudiModale = () => {
        setShowModal(false);
        setProdottoSelezionato(null);
    };

    const ModalResult = (
        <Modal centered show={showResult} onHide={() => {
            setShowResult(false);
            setProdottoSelezionato(null);
        }}>
            <Modal.Body>
                <strong>{prodottoSelezionato?.nome_impianto}</strong> aggiunto ai preferiti!
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    router.push('/preferiti');
                }} variant="" className={''}><FavoriteIcon className={'text-danger'}/> Visualizza
                    tutti</Button>
                <Button onClick={() => {
                    setShowResult(false);
                }}>Ok</Button>
            </Modal.Footer>
        </Modal>
    );

    const ModalComponent = (
        <Modal show={showModal} onHide={chiudiModale} centered>
            <Modal.Body>
                Sei sicuro di voler rimuovere <strong>{prodottoSelezionato?.nome_impianto}</strong> dai preferiti?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="" onClick={chiudiModale}>Annulla</Button>
                <Button variant="danger" onClick={() => eseguiToggle(prodottoSelezionato?.id_impianto)}>
                    Sì, rimuovi
                </Button>
            </Modal.Footer>
        </Modal>
    );

    return {preferiti, gestisciClickCuore, ModalComponent, ModalResult}

}