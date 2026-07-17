// src/cron/check-price-alerts.test.js
import {checkPriceAlerts, generateUnsubscribeToken} from './check-price-alerts';
// Importa i moduli mockati DOPO aver chiamato jest.mock()
import * as mysqlMock from 'mysql2/promise';
import * as fsMock from 'fs/promises';
import * as nodemailerMock from 'nodemailer';
import * as cryptoMock from 'crypto';

// ********************************************************************
// AGGIUNGI QUESTE RIGHE PER DIRE A JEST DI USARE I MOCK
// ********************************************************************
jest.mock('mysql2/promise');
jest.mock('fs/promises');
jest.mock('nodemailer');
jest.mock('crypto');
// ********************************************************************

const {createConnection, _mockExecute, _mockConnection} = mysqlMock;

const {appendFile: mockAppendFile, mkdir: mockMkdir} = fsMock;

const {_mockSendMail} = nodemailerMock;

const {createHmac: mockCreateHmac} = cryptoMock;


describe('checkPriceAlerts', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Pulisce tutti i mock

        // Mock per mysql2/promise
        createConnection.mockResolvedValue(_mockConnection);
        _mockExecute.mockResolvedValue([[]]); // Default per execute

        // Mock per fs/promises
        mockAppendFile.mockResolvedValue(undefined);
        mockMkdir.mockResolvedValue(undefined);

        // Mock per nodemailer
        _mockSendMail.mockResolvedValue(true);

        // Mock per crypto (per generateUnsubscribeToken)
        mockCreateHmac.mockReturnValue({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn(() => 'mocked_digest_hex'),
        });

        // Mock per Date per avere un NOW() consistente
        jest.spyOn(global, 'Date').mockImplementation(() => new Date('2023-01-01T12:00:00Z'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should send an alert for cheapest_in_area subscription', async () => {
        // Mock subscriptions
        _mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 1, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'Benzina', geo_level: 'nazionale', geo_code: 'IT',
                threshold_type: 'cheapest_in_area', threshold_value: null,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        _mockExecute.mockResolvedValueOnce([ // SELECT current price
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

        expect(createConnection).toHaveBeenCalledTimes(1);
        expect(_mockExecute).toHaveBeenCalledWith(expect.stringContaining('SELECT s.*, u.email, u.name AS user_name FROM price_subscriptions s JOIN users u ON s.user_id = u.id WHERE s.status = \'active\''), expect.any(Array));
        expect(_mockExecute).toHaveBeenCalledWith(expect.stringContaining('SELECT p.prezzo, p.dtcomu, i.nome_impianto, i.indirizzo, i.comune, i.provincia FROM prezzi p JOIN impianti i ON p.id_impianto = i.id_impianto WHERE p.fuel_id = ? AND p.is_self = 1 AND p.prezzo > 0.5 ORDER BY p.prezzo LIMIT 1'), [1]);
        expect(_mockSendMail).toHaveBeenCalledTimes(1);
        expect(_mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'user@example.com',
            subject: expect.stringContaining('Avviso Prezzo Benzina a IT: 1.850 €/L'),
            html: expect.stringContaining('Stazione Test'),
        }));

        expect(_mockExecute).toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [1]);
        expect(_mockExecute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO sent_notifications'), [1, 1, 'Benzina', 'nazionale', 'IT', 1.850, 'sent']);
        expect(_mockConnection.end).toHaveBeenCalledTimes(1);
    });

    it('should send an alert for below_price subscription when condition met', async () => {
        // Mock subscriptions
        _mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 2, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'Gasolio', geo_level: 'provinciale', geo_code: 'MI',
                threshold_type: 'below_price', threshold_value: 1.700,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        _mockExecute.mockResolvedValueOnce([ // SELECT current price
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

        expect(_mockSendMail).toHaveBeenCalledTimes(1);
        expect(_mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'user@example.com',
            subject: expect.stringContaining('Avviso Prezzo Gasolio a MI: 1.690 €/L'),
        }));
        expect(_mockExecute).toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [2]);
        expect(_mockExecute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO sent_notifications'), [2, 1, 'Gasolio', 'provinciale', 'MI', 1.690, 'sent']);
    });

    it('should NOT send an alert for below_price subscription when condition NOT met', async () => {
        // Mock subscriptions
        _mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 3, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'GPL', geo_level: 'comune', geo_code: 'Napoli',
                threshold_type: 'below_price', threshold_value: 0.800,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        _mockExecute.mockResolvedValueOnce([ // SELECT current price
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

        expect(_mockSendMail).not.toHaveBeenCalled();
        expect(_mockExecute).not.toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [3]);
        expect(_mockExecute).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO sent_notifications'), expect.any(Array));
    });

    it('should handle no active subscriptions', async () => {
        _mockExecute.mockResolvedValueOnce([[]]); // No subscriptions

        await checkPriceAlerts();

        expect(_mockSendMail).not.toHaveBeenCalled();
        expect(_mockExecute).toHaveBeenCalledWith(expect.stringContaining('SELECT s.*, u.email, u.name AS user_name FROM price_subscriptions s JOIN users u ON s.user_id = u.id WHERE s.status = \'active\''), expect.any(Array));
        expect(mockAppendFile).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('Trovate 0 sottoscrizioni attive idonee per il controllo.'), 'utf8');

        expect(_mockConnection.end).toHaveBeenCalledTimes(1);
    });

    it('should handle no price found for a subscription', async () => {
        // Mock subscriptions
        _mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 4, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'Metano', geo_level: 'nazionale', geo_code: 'IT',
                threshold_type: 'cheapest_in_area', threshold_value: null,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        _mockExecute.mockResolvedValueOnce([[]]); // No price found

        await checkPriceAlerts();

        expect(_mockSendMail).not.toHaveBeenCalled();
        expect(mockAppendFile).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('Nessun prezzo trovato per Metano a livello nazionale con codice IT.'), 'utf8');
        expect(_mockExecute).not.toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [4]);
    });

    it('should log email sending failure', async () => {
        // Mock subscriptions
        _mockExecute.mockResolvedValueOnce([ // SELECT subscriptions
            [{
                id: 5, user_id: 1, email: 'user@example.com', user_name: 'Test User',
                fuel_type: 'Benzina', geo_level: 'nazionale', geo_code: 'IT',
                threshold_type: 'cheapest_in_area', threshold_value: null,
                status: 'active', last_notified_at: null
            }]
        ]);
        // Mock current price
        _mockExecute.mockResolvedValueOnce([ // SELECT current price
            [{
                prezzo: 1.850,
                dtcomu: '2023-01-01 10:00:00',
                nome_impianto: 'Stazione Test',
                indirizzo: 'Via Roma 1',
                comune: 'Roma',
                provincia: 'RM'
            }]
        ]);
        _mockSendMail.mockRejectedValueOnce(new Error('Email service down')); // Simulate email failure

        await checkPriceAlerts();

        expect(_mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockAppendFile).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('Errore durante l\'invio dell\'email a user@example.com'), 'utf8');

        expect(_mockExecute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO sent_notifications'), [5, 1, 'Benzina', 'nazionale', 'IT', 1.850, 'failed']);
        expect(_mockExecute).not.toHaveBeenCalledWith('UPDATE price_subscriptions SET last_notified_at = NOW() WHERE id = ?', [5]); // last_notified_at non aggiornato
    });

    it('should handle database connection failure', async () => {
        createConnection.mockRejectedValueOnce(new Error('DB connection failed'));

        await checkPriceAlerts();

        expect(mockAppendFile).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('--- ERRORE FATALE SCRIPT CONTROLLO NOTIFICHE: DB connection failed ---'), 'utf8');
        expect(createConnection).toHaveBeenCalledTimes(1);
        expect(_mockConnection.end).not.toHaveBeenCalled();
    });

    it('should generate unsubscribe token correctly', () => {
        const token = generateUnsubscribeToken(123, 456);
        expect(token).toBe('mocked_digest_hex'); // Dal mock di crypto
        expect(mockCreateHmac).toHaveBeenCalledWith('sha256', expect.any(String));
        expect(mockCreateHmac().update).toHaveBeenCalledWith('123-456');
    });
});