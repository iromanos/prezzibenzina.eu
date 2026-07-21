import {GET} from './route';
import {connectToDatabase} from '@/repos/mysql';

// Mock the database connection
jest.mock('@/repos/mysql', () => ({
    connectToDatabase: jest.fn(),
}));

describe('GET /api/impianti/[id]/average-rating', () => {
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

    it('should return average rating and total reviews for a given impianto ID', async () => {
        const mockRatingData = {average_rating: '4.50', total_reviews: 10};
        mockQuery.mockResolvedValueOnce([[mockRatingData]]);

        const mockRequest = {};
        const mockParams = {params: {id: '1'}};

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockRatingData);

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT average_rating, total_reviews FROM impianti WHERE id_impianto = ?'),
            ['1']
        );
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if impianto is not found', async () => {
        mockQuery.mockResolvedValueOnce([[]]); // No impianto found

        const mockRequest = {};
        const mockParams = {params: {id: '999'}}; // Non-existent impianto

        const response = await GET(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toBe('Impianto not found');

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT average_rating, total_reviews FROM impianti WHERE id_impianto = ?'),
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
        expect(data.message).toBe('Error fetching average rating');
        expect(data.error).toBe('DB fetch error');

        expect(connectToDatabase).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockEnd).toHaveBeenCalledTimes(1);
    });
});
