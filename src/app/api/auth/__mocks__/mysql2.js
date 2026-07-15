// src/app/api/auth/__mocks__/mysql2.js
const mockExecute = jest.fn();
const mockConnection = {
    execute: mockExecute,
    end: jest.fn(() => Promise.resolve()),
};
const mockCreateConnection = jest.fn(() => Promise.resolve(mockConnection));

module.exports = {
    createConnection: mockCreateConnection,
    // Esporta i mock per poterli manipolare nei test
    _mockExecute: mockExecute,
    _mockConnection: mockConnection,
    _mockCreateConnection: mockCreateConnection,
};