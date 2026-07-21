import React, {useEffect} from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import SegnalaClient from './SegnalaClient.jsx';
import {GoogleReCaptcha} from 'react-google-recaptcha-v3';

// Mock delle dipendenze esterne
jest.mock('next/link', () => {
    return ({children, href}) => {
        return <a href={href}>{children}</a>;
    };
});

jest.mock('@/components/Header', () => {
    return function DummyHeader() {
        return <header>Header</header>;
    };
});

jest.mock('next/image', () => {
    return ({src, alt}) => {
        // eslint-disable-next-line @next/next/no-img-alt
        return <img src={src} alt={alt}/>;
    };
});


// Eseguiamo il mock definito sopra
jest.mock('react-google-recaptcha-v3', () => ({
    GoogleReCaptchaProvider: ({children}) => <>{children}</>,

    // Fai il mock di GoogleReCaptcha come un vero componente React
    GoogleReCaptcha: jest.fn(),
}));


// Mock della funzione fetch globale
global.fetch = jest.fn();

describe('SegnalaClient', () => {


    const mockExecuteRecaptcha = jest.fn();

    const mockDistributore = {
        link: 'test-distributore',
        image: '/bandiere/test.png',
        bandiera: 'Test Bandiera',
        nome_impianto: 'Impianto Prova',
        indirizzo: 'Via Prova 123',
        comune: 'Provincia',
        provincia: 'PV',
    };

    beforeEach(() => {
        // Resetta il mock di fetch prima di ogni test
        fetch.mockClear();
    });

    it('dovrebbe renderizzare correttamente le informazioni del distributore e il form', () => {
        render(<SegnalaClient distributore={mockDistributore}/>);

        // Controlla le informazioni del distributore
        expect(screen.getByText('Test Bandiera')).toBeInTheDocument();
        expect(screen.getByText('Impianto Prova')).toBeInTheDocument();
        expect(screen.getByText(/Via Prova 123 - Provincia \(PV\)/)).toBeInTheDocument();

        // Controlla gli elementi del form
        expect(screen.getByRole('heading', {name: /Segnala dati inesatti/i})).toBeInTheDocument();
        expect(screen.getByLabelText(/Oggetto della segnalazione/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Dettagli/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/La tua Email \(opzionale\)/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Invia la segnalazione/i})).toBeInTheDocument();
    });

    it('dovrebbe aggiornare lo stato quando l\'utente compila il form', () => {
        render(<SegnalaClient distributore={mockDistributore}/>);

        const select = screen.getByLabelText(/Oggetto della segnalazione/i);
        const textarea = screen.getByLabelText(/Dettagli/i);
        const emailInput = screen.getByLabelText(/La tua Email \(opzionale\)/i);

        fireEvent.change(select, {target: {value: 'prezzo'}});
        fireEvent.change(textarea, {target: {value: 'Il prezzo del diesel è sbagliato.'}});
        fireEvent.change(emailInput, {target: {value: 'test@example.com'}});

        expect(select.value).toBe('prezzo');
        expect(textarea.value).toBe('Il prezzo del diesel è sbagliato.');
        expect(emailInput.value).toBe('test@example.com');
    });

    it('dovrebbe inviare il form e mostrare un messaggio di successo', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({message: 'Messaggio inviato con successo!'}),
        });

        GoogleReCaptcha.mockImplementation(({onVerify}) => {
            useEffect(() => {
                onVerify('mock-recaptcha-token');
            }, [onVerify]);

            return <div data-testid="mock-recaptcha"/>;
        });

        render(<SegnalaClient distributore={mockDistributore}/>);


        // Compila il form
        fireEvent.change(screen.getByLabelText(/Oggetto della segnalazione/i), {target: {value: 'prezzo'}});
        fireEvent.change(screen.getByLabelText(/Dettagli/i), {target: {value: 'Il prezzo non è corretto.'}});
        fireEvent.change(screen.getByLabelText(/La tua Email \(opzionale\)/i), {target: {value: 'user@test.com'}});

        // Invia il form
        const submitButton = screen.getByRole('button', {name: /Invia la segnalazione/i});
        fireEvent.click(submitButton);

        // Attendi la risposta e il rendering del messaggio di successo
        await waitFor(() => {
            expect(screen.getByText('Messaggio inviato con successo!')).toBeInTheDocument();
        });

        // Verifica che fetch sia stato chiamato correttamente
        expect(fetch).toHaveBeenCalledWith('/api/contact', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                tipo_segnalazione: 'prezzo',
                messaggio: 'Il prezzo non è corretto.',
                email: 'user@test.com',
                recaptchaToken: 'mock-recaptcha-token',
            }),
        });
    });

    it('dovrebbe mostrare un messaggio di errore se la chiamata API fallisce', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({error: 'Errore API simulato.'}),
        });


        render(<SegnalaClient distributore={mockDistributore}/>);

        // Invia il form
        const submitButton = screen.getByRole('button', {name: /Invia la segnalazione/i});
        fireEvent.click(submitButton);

        // Attendi il messaggio di errore
        await waitFor(() => {
            expect(screen.getByText('Errore API simulato.')).toBeInTheDocument();
        });
    });

    it('dovrebbe mostrare un errore se la verifica reCAPTCHA non è presente', async () => {

        GoogleReCaptcha.mockImplementation(({onVerify}) => {
            useEffect(() => {
                onVerify('');
            }, [onVerify]);

            return <div data-testid="mock-recaptcha"/>;
        });

        render(<SegnalaClient distributore={mockDistributore}/>);

        // Clicca il bottone di invio
        const submitButton = screen.getByRole('button', {name: /Invia la segnalazione/i});
        fireEvent.click(submitButton);

        // Attendi il messaggio di errore specifico per reCAPTCHA
        await waitFor(() => {
            expect(screen.getByText('Verifica reCAPTCHA non completata. Riprova.')).toBeInTheDocument();
        });
    });
});