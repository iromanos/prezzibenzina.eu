// src/app/api/auth/forgot-password/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';
import {_mockSendMail} from '../__mocks__/nodemailer';

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

describe('POST /api/auth/forgot-password', () => {
    const MOCKED_RESET_TOKEN = 'mocked_reset_token_hex';
    const _mockCreateConnection = mysql.createConnection;

    const mockCryptoRandomBytes = crypto.randomBytes;

    beforeEach(() => {
        jest.clearAllMocks();
        _mockCreateConnection.mockClear();
        mockExecute.mockClear();
        NextResponse.json.mockClear();
        _mockSendMail.mockResolvedValue(true); // Email sends successfully by default
        mockCryptoRandomBytes.mockReturnValue({toString: () => MOCKED_RESET_TOKEN});
        jest.spyOn(global.Date, 'now').mockReturnValue(1678886400000); // Mock current time for consistent expiry
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should send a password reset email successfully', async () => {
        mockExecute.mockResolvedValueOnce([[{id: 1}]]); // User found
        mockExecute.mockResolvedValueOnce([{affectedRows: 1}]); // Token updated

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(_mockCreateConnection).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith('SELECT id FROM users WHERE email = ?', ['test@example.com']);

        expect(mockCryptoRandomBytes).toHaveBeenCalledWith(32);
        expect(mockExecute).toHaveBeenCalledWith(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [MOCKED_RESET_TOKEN, expect.any(Date), 1]
        );
        expect(_mockSendMail).toHaveBeenCalledTimes(1);
        expect(_mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'test@example.com',
                subject: 'Reset della password per PrezziBenzina.eu',
                html: expect.stringContaining(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${MOCKED_RESET_TOKEN}`),
            })
        );
        expect(NextResponse.json).toHaveBeenCalledWith({message: 'Se l\'email è registrata, riceverai un link per il reset della password.'}, {status: 200});
    });

    it('should return 400 if email is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Email è obbligatoria.'}, {status: 400});
        expect(_mockCreateConnection).not.toHaveBeenCalled();
    });

    it('should return 200 even if user not found (security measure)', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No user found

        const mockRequest = {
            json: () => Promise.resolve({email: 'nonexistent@example.com'}),
        };

        await POST(mockRequest);

        expect(mockExecute).toHaveBeenCalledWith('SELECT id FROM users WHERE email = ?', ['nonexistent@example.com']);
        expect(NextResponse.json).toHaveBeenCalledWith({message: 'Se l\'email è registrata, riceverai un link per il reset della password.'}, {status: 200});
        expect(_mockSendMail).not.toHaveBeenCalled(); // No email sent
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
        mockExecute.mockResolvedValueOnce([[{id: 1}]]);
        mockExecute.mockResolvedValueOnce([{affectedRows: 1}]);
        _mockSendMail.mockRejectedValueOnce(new Error('Email service down'));

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
    });
});