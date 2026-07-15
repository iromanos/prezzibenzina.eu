// src/app/api/auth/verify-email/request/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';
import {_mockSendMail} from '../../__mocks__/nodemailer';

import mysql from 'mysql2/promise';
import crypto from 'crypto';

const mockEnd = jest.fn(() => Promise.resolve());
const mockExecute = jest.fn();
jest.mock('mysql2/promise', () => {
    return {
        createConnection: jest.fn(() => Promise.resolve({
            execute: mockExecute,
            end: mockEnd,
        })),
    };
});

jest.mock('bcrypt');
jest.mock('crypto', () => {
    return {
        randomBytes: jest.fn(),
    }
});

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

describe('POST /api/auth/verify-email/request', () => {
    const MOCKED_VERIFICATION_TOKEN = 'mocked_token_hex';
    const mockCryptoRandomBytes = crypto.randomBytes;

    beforeEach(() => {
        jest.clearAllMocks();
        mysql.createConnection.mockClear();
        mockExecute.mockClear();
        NextResponse.json.mockClear();
        _mockSendMail.mockResolvedValue(true); // Email sends successfully by default
        mockCryptoRandomBytes.mockReturnValue({toString: () => MOCKED_VERIFICATION_TOKEN});
    });

    it('should send a verification email successfully', async () => {
        mockExecute.mockResolvedValueOnce([[{id: 1, email_verified_at: null}]]); // User found, not verified
        mockExecute.mockResolvedValueOnce([{affectedRows: 1}]); // Token updated

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(mysql.createConnection).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith('SELECT id, email_verified_at FROM users WHERE email = ?', ['test@example.com']);
        expect(mockCryptoRandomBytes).toHaveBeenCalledWith(32);
        expect(mockExecute).toHaveBeenCalledWith('UPDATE users SET verification_token = ? WHERE id = ?', [MOCKED_VERIFICATION_TOKEN, 1]);
        expect(_mockSendMail).toHaveBeenCalledTimes(1);
        expect(_mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'test@example.com',
                subject: 'Verifica il tuo indirizzo email per PrezziBenzina.eu',
                html: expect.stringContaining(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${MOCKED_VERIFICATION_TOKEN}`),
            })
        );
        expect(NextResponse.json).toHaveBeenCalledWith({message: 'Link di verifica inviato alla tua email.'}, {status: 200});
    });

    it('should return 400 if email is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Email è obbligatoria.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No user found

        const mockRequest = {
            json: () => Promise.resolve({email: 'nonexistent@example.com'}),
        };

        await POST(mockRequest);

        expect(mockExecute).toHaveBeenCalledWith('SELECT id, email_verified_at FROM users WHERE email = ?', ['nonexistent@example.com']);
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Utente non trovato.'}, {status: 404});
        expect(_mockSendMail).not.toHaveBeenCalled();
    });

    it('should return 200 if email is already verified', async () => {
        mockExecute.mockResolvedValueOnce([[{id: 1, email_verified_at: 1}]]); // User found, already verified

        const mockRequest = {
            json: () => Promise.resolve({email: 'verified@example.com'}),
        };

        await POST(mockRequest);

        expect(mockExecute).toHaveBeenCalledWith('SELECT id, email_verified_at FROM users WHERE email = ?', ['verified@example.com']);
        expect(NextResponse.json).toHaveBeenCalledWith({message: 'L\'email è già stata verificata.'}, {status: 200});
        expect(_mockSendMail).not.toHaveBeenCalled();
    });

    it('should return 500 for database errors', async () => {
        mockExecute.mockRejectedValueOnce(new Error('DB connection failed'));

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
        expect(_mockSendMail).not.toHaveBeenCalled();
    });

    it('should return 500 if email sending fails', async () => {
        mockExecute.mockResolvedValueOnce([[{id: 1, email_verified_at: null}]]);
        mockExecute.mockResolvedValueOnce([{affectedRows: 1}]);
        _mockSendMail.mockRejectedValueOnce(new Error('Email service down'));

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
    });
});