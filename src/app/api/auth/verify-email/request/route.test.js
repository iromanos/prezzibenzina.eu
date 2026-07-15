// src/app/api/auth/verify-email/request/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';
import {_mockCreateConnection, _mockExecute} from '../../../__mocks__/mysql2';
import {_mockSendMail} from '../../../__mocks__/nodemailer';
import {randomBytes as mockCryptoRandomBytes} from '../../../__mocks__/crypto';

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

describe('POST /api/auth/verify-email/request', () => {
    const MOCKED_VERIFICATION_TOKEN = 'mocked_token_hex';

    beforeEach(() => {
        jest.clearAllMocks();
        _mockCreateConnection.mockClear();
        _mockExecute.mockClear();
        NextResponse.json.mockClear();
        _mockSendMail.mockResolvedValue(true); // Email sends successfully by default
        mockCryptoRandomBytes.mockReturnValue({toString: () => MOCKED_VERIFICATION_TOKEN});
    });

    it('should send a verification email successfully', async () => {
        _mockExecute.mockResolvedValueOnce([[{id: 1, is_verified: 0}]]); // User found, not verified
        _mockExecute.mockResolvedValueOnce([{affectedRows: 1}]); // Token updated

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(_mockCreateConnection).toHaveBeenCalledTimes(1);
        expect(_mockExecute).toHaveBeenCalledWith('SELECT id, is_verified FROM users WHERE email = ?', ['test@example.com']);
        expect(mockCryptoRandomBytes).toHaveBeenCalledWith(32);
        expect(_mockExecute).toHaveBeenCalledWith('UPDATE users SET verification_token = ? WHERE id = ?', [MOCKED_VERIFICATION_TOKEN, 1]);
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
        expect(_mockCreateConnection).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
        _mockExecute.mockResolvedValueOnce([[]]); // No user found

        const mockRequest = {
            json: () => Promise.resolve({email: 'nonexistent@example.com'}),
        };

        await POST(mockRequest);

        expect(_mockExecute).toHaveBeenCalledWith('SELECT id, is_verified FROM users WHERE email = ?', ['nonexistent@example.com']);
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Utente non trovato.'}, {status: 404});
        expect(_mockSendMail).not.toHaveBeenCalled();
    });

    it('should return 200 if email is already verified', async () => {
        _mockExecute.mockResolvedValueOnce([[{id: 1, is_verified: 1}]]); // User found, already verified

        const mockRequest = {
            json: () => Promise.resolve({email: 'verified@example.com'}),
        };

        await POST(mockRequest);

        expect(_mockExecute).toHaveBeenCalledWith('SELECT id, is_verified FROM users WHERE email = ?', ['verified@example.com']);
        expect(NextResponse.json).toHaveBeenCalledWith({message: 'L\'email è già stata verificata.'}, {status: 200});
        expect(_mockSendMail).not.toHaveBeenCalled();
    });

    it('should return 500 for database errors', async () => {
        _mockExecute.mockRejectedValueOnce(new Error('DB connection failed'));

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
        expect(_mockSendMail).not.toHaveBeenCalled();
    });

    it('should return 500 if email sending fails', async () => {
        _mockExecute.mockResolvedValueOnce([[{id: 1, is_verified: 0}]]);
        _mockExecute.mockResolvedValueOnce([{affectedRows: 1}]);
        _mockSendMail.mockRejectedValueOnce(new Error('Email service down'));

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
    });
});