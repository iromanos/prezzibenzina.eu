import {GET} from './route';
import {connectToDatabase} from '@/repos/mysql';

// Mock the database connection
jest.mock('@/repos/mysql', () => ({
    connectToDatabase: jest.fn(),
}));

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

describe('GET /api/impianti/[id]/reviews', () => {
    let mockConnection;
    let mockQuery;
    let mockEnd;

    beforeEach(() => {
        mockQuery = jest.fn();
        mockEnd = jest.fn();

        mockConnection = {
            query: mockQuery,
            end: mockEnd,
        };

        connectToDatabase.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return reviews for a given impianto ID', async () => {
        const mockReviews = [
            {
                id: 1,
                id_impianto: 1,
                user_id: 101,
                user_name: 'UserA',
                rating: 5,
                comment: 'Excellent!',
                created_at: '2023-01-01'
            },
            {
                id: 2,
                id_impianto: 1,
                user_id: 102,
                user_name: 'UserB',
                rating: 4,
                comment: 'Good.',
                created_at: '2023-01-02'
            },
        ];

        mockQuery.mockResolvedValueOnce([mockReviews]);

        const mockRequest = {}; // GET requests don't typically have a body
        const mockParams = {params: {id: '1'}};

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockReviews);

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT r.id, r.id_impianto, r.user_id, u.name as user_name, r.rating, r.comment, r.created_at, r.updated_at'),
            ['1']
        );
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no reviews are found', async () => {
        mockQuery.mockResolvedValueOnce([[]]); // No reviews found

        const mockRequest = {};
        const mockParams = {params: {id: '999'}}; // Non-existent impianto

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT r.id, r.id_impianto, r.user_id, u.name as user_name, r.rating, r.comment, r.created_at, r.updated_at'),
            ['999']
        );
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if id_impianto parameter is missing', async () => {
        const mockRequest = {};
        const mockParams = {params: {}}; // Missing id

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing id_impianto parameter');

        expect(connectToDatabase).not.toHaveBeenCalled();
        expect(mockQuery).not.toHaveBeenCalled();
        expect(mockEnd).not.toHaveBeenCalled();
    });

    it('should return 500 if a database error occurs', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB fetch error'));

        const mockRequest = {};
        const mockParams = {params: {id: '1'}};

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error fetching reviews');
        expect(data.error).toBe('DB fetch error');

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });
});
