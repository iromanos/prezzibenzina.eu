import {GET} from './route';
import mysql from 'mysql2/promise';

const mockExecute = jest.fn();
jest.mock('mysql2/promise', () => {
    return {
        createPool: jest.fn(() => ({
            execute: mockExecute,
        }))
    };
});

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({
            status: options?.status || 200,
            json: async () => body, // Simula il comportamento della Web API Response
        })),
    },
}));

describe('GET /api/impianti/[id]/average-rating', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return average rating and total reviews for a given impianto ID', async () => {
        const mockRatingData = {average_rating: '4.50', total_reviews: 10};
        mockExecute.mockResolvedValueOnce([[mockRatingData]]);

        const mockRequest = {};
        const mockParams = {params: {id: '1'}};

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockRatingData);

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining(`SELECT average_rating, total_reviews
                                     FROM impianti
                                     WHERE id_impianto = ?`),
            ['1']
        );
    });

    it('should return 404 if impianto is not found', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No impianto found

        const mockRequest = {};
        const mockParams = {params: {id: '999'}}; // Non-existent impianto

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toBe('Impianto not found');

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenLastCalledWith(
            expect.stringMatching(/SELECT\s+average_rating,\s+total_reviews\s+FROM\s+impianti\s+WHERE\s+id_impianto\s+=\s+\?/i),
            ['999']
        );
    });

    it('should return 400 if id_impianto parameter is missing', async () => {
        const mockRequest = {};
        const mockParams = {params: {}}; // Missing id

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing id_impianto parameter');

        expect(mysql.createPool).not.toHaveBeenCalled();
        expect(mockExecute).not.toHaveBeenCalled();
    });

    it('should return 500 if a database error occurs', async () => {
        mockExecute.mockRejectedValueOnce(new Error('DB fetch error'));

        const mockRequest = {};
        const mockParams = {params: {id: '1'}};

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('DB fetch error');

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledTimes(1);
    });
});
