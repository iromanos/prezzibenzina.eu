'use client';

import React, {useEffect, useRef} from 'react';
import {Button, Modal} from 'react-bootstrap'; // Assicurati di avere react-bootstrap installato

export default function BootstrapModal({show, handleClose, title, body, type = 'info', confirmButtonText, onConfirm}) {
    const modalRef = useRef(null);

    useEffect(() => {
        // Importa Bootstrap JavaScript dinamicamente per il modal
        import('bootstrap/dist/js/bootstrap.bundle.min');
    }, []);

    const getHeaderBgClass = () => {
        switch (type) {
            case 'success':
                return 'bg-success text-white';
            case 'danger':
                return 'bg-danger text-white';
            case 'warning':
                return 'bg-warning text-dark';
            case 'info':
                return 'bg-primary text-white';
            default:
                return 'bg-primary text-white';
        }
    };

    return (
        <Modal show={show} onHide={handleClose} ref={modalRef} centered>
            <Modal.Header closeButton className={getHeaderBgClass()}>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Chiudi
                </Button>
                {onConfirm && (
                    <Button variant={type === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
                        {confirmButtonText || 'Conferma'}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}