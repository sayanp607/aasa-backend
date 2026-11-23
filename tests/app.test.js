const request = require('supertest');
process.env.NODE_ENV = 'test';
const { app, server } = require('../server');

describe('Aasa Backend API Health & Base Endpoints', () => {
    afterAll((done) => {
        if (server && server.close) {
            server.close(done);
        } else {
            done();
        }
    });

    test('GET / should return 200 and healthy status', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('message', 'Aasa Backend API is running');
    });

    test('Non-existent route should return 404', async () => {
        const response = await request(app).get('/api/non-existent-endpoint-test');
        expect(response.statusCode).toBe(404);
    });
});
