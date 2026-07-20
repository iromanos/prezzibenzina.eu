// src/cron/check-price-alerts.test.js
import {checkPriceAlerts, generateUnsubscribeToken, invioEmail} from './check-price-alerts';

import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';


jest.mock('nodemailer');
jest.mock('mysql2/promise');

// 1. Creiamo i mock per la catena dei metodi
const mockDigest = jest.fn().mockReturnValue('hash_fittizio_123');
const mockUpdate = jest.fn().mockReturnValue({digest: mockDigest});
const mockCreateHmac = jest.fn().mockReturnValue({update: mockUpdate});

// 2. Usiamo jest.requireActual per preservare il resto delle funzioni di crypto
jest.mock('crypto', () => ({
    ...jest.requireActual('crypto'),
    createHmac: (...args) => mockCreateHmac(...args),
}));

const mockSendMail = jest.fn();
const mockExecute = jest.fn();
const mockConnection = {
    execute: mockExecute,
    end: jest.fn(),
};



describe('checkPriceAlerts', () => {


    beforeEach(() => {
        jest.clearAllMocks(); // Pulisce tutti i mock

        nodemailer.createTransport.mockReturnValue({
            sendMail: mockSendMail,
        });

        mysql.createConnection.mockResolvedValue(mockConnection);

        // Mock per Date usando fakeTimers per evitare ricorsione infinita
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('test invio e-mail', async () => {

        await invioEmail();
        // Verifichiamo che createTransport sia stato chiamato
        expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);

        // Verifichiamo i dettagli inviati a sendMail
        expect(mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'utente@example.com',
                subject: 'Benvenuto',
            })
        );
    });

    it('should send an alert for cheapest_in_area subscription', async () => {
        // Mock subscriptions
        mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 1, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'Benzina', geo_level: 'nazionale', geo_code: 'IT',
                threshold_type: 'cheapest_in_area', threshold_value: null,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        mockExecute.mockResolvedValueOnce([ // SELECT current price
            [{
                prezzo: 1.850,
                dtcomu: '2023-01-01 10:00:00',
                nome_impianto: 'Stazione Test',
                indirizzo: 'Via Roma 1',
                comune: 'Roma',
                provincia: 'RM'
            }]
        ]);

        await checkPriceAlerts();

        expect(mysql.createConnection).toHaveBeenCalledTimes(1);
        // expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('SELECT s.*, u.email, u.name AS user_name FROM price_subscriptions s JOIN users u ON s.user_id = u.id WHERE s.status = \'active\' AND (s.last_notified_at IS NULL OR s.last_notified_at <= NOW() - INTERVAL 24 HOUR)'), expect.any(Array));
        // expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('SELECT p.prezzo, p.dtcomu, i.nome_impianto, i.indirizzo, i.comune, i.provincia FROM prezzi p JOIN impianti i ON p.id_impianto = i.id_impianto WHERE p.fuel_id = ? AND p.is_self = 1 AND p.prezzo > 0.5 ORDER BY p.prezzo LIMIT 1'), [1]);
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'user@example.com',
            subject: expect.stringContaining('Avviso Prezzo Benzina a IT: 1.850 €/L'),
            html: expect.stringContaining('Stazione Test'),
        }));

        expect(mockExecute).toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [1]);

    });

    it('should send an alert for below_price subscription when condition met', async () => {
        // Mock subscriptions
        mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 2, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'Gasolio', geo_level: 'provinciale', geo_code: 'MI',
                threshold_type: 'below_price', threshold_value: 1.700,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        mockExecute.mockResolvedValueOnce([ // SELECT current price
            [{
                prezzo: 1.690,
                dtcomu: '2023-01-01 10:00:00',
                nome_impianto: 'Stazione MI',
                indirizzo: 'Via Milano 1',
                comune: 'Milano',
                provincia: 'MI'
            }]
        ]);

        await checkPriceAlerts();

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'user@example.com',
            subject: expect.stringContaining('Avviso Prezzo Gasolio a MI: 1.690 €/L'),
        }));
        expect(mockExecute).toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [2]);
    });

    it('should NOT send an alert for below_price subscription when condition NOT met', async () => {
        // Mock subscriptions
        mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 3, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'GPL', geo_level: 'comune', geo_code: 'Napoli',
                threshold_type: 'below_price', threshold_value: 0.800,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        mockExecute.mockResolvedValueOnce([ // SELECT current price
            [{
                prezzo: 0.850,
                dtcomu: '2023-01-01 10:00:00',
                nome_impianto: 'Stazione NA',
                indirizzo: 'Via Napoli 1',
                comune: 'Napoli',
                provincia: 'NA'
            }]
        ]);

        await checkPriceAlerts();

        expect(mockSendMail).not.toHaveBeenCalled();
        expect(mockExecute).not.toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [3]);
        expect(mockExecute).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO sent_notifications'), expect.any(Array));
    });

    it('should handle no active subscriptions', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No subscriptions

        await checkPriceAlerts();

        expect(mockSendMail).not.toHaveBeenCalled();

        expect(mockConnection.end).toHaveBeenCalledTimes(1);
    });

    it('should handle no price found for a subscription', async () => {
        // Mock subscriptions
        mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 4, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'Metano', geo_level: 'nazionale', geo_code: 'IT',
                threshold_type: 'cheapest_in_area', threshold_value: null,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        mockExecute.mockResolvedValueOnce([[]]); // No price found

        await checkPriceAlerts();

        expect(mockSendMail).not.toHaveBeenCalled();
        expect(mockExecute).not.toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [4]);
    });

    it('should log email sending failure', async () => {
        // Mock subscriptions
        mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 5, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'Benzina', geo_level: 'nazionale', geo_code: 'IT',
                threshold_type: 'cheapest_in_area', threshold_value: null,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        mockExecute.mockResolvedValueOnce([ // SELECT current price
            [{
                prezzo: 1.850,
                dtcomu: '2023-01-01 10:00:00',
                nome_impianto: 'Stazione Test',
                indirizzo: 'Via Roma 1',
                comune: 'Roma',
                provincia: 'RM'
            }]
        ]);
        mockSendMail.mockRejectedValueOnce(new Error('Email service down')); // Simulate email failure

        await checkPriceAlerts();

        expect(mockSendMail).toHaveBeenCalledTimes(1);

        expect(mockExecute).not.toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [5]); // last_notified_at non aggiornato
    });

    it('should handle database connection failure', async () => {
        mysql.createConnection.mockRejectedValueOnce(new Error('DB connection failed'));

        await checkPriceAlerts();

        //expect(appendFile).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('--- ERRORE FATALE SCRIPT CONTROLLO NOTIFICHE: DB connection failed ---'), 'utf8');
        expect(mysql.createConnection).toHaveBeenCalledTimes(1);
        expect(mockConnection.end).not.toHaveBeenCalled();
    });

    it('should generate unsubscribe token correctly', () => {
        const token = generateUnsubscribeToken(123, 456);
        expect(token).toBe('hash_fittizio_123'); // Dal mock di crypto
        expect(mockCreateHmac).toHaveBeenCalledWith('sha256', expect.any(String));
        expect(mockCreateHmac().update).toHaveBeenCalledWith('123-456');
    });
});