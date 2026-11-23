const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_integration_jwt_secret';
process.env.PORT = '5002';

const { app, server } = require('../../server');

describe('Backend Integration Tests - API Lifecycle & Security', () => {
    afterAll((done) => {
        if (server && server.close) {
            server.close(done);
        } else {
            done();
        }
    });

    describe('System Health & Base Routes', () => {
        it('GET / should return healthy status and metadata', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toEqual({
                status: 'ok',
                message: 'Aasa Backend API is running'
            });
        });

        it('GET /api/unknown-endpoint should return 404 for undefined routes', async () => {
            const res = await request(app).get('/api/unknown-endpoint');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('Protected Route Security Integration', () => {
        it('POST /api/orders/create should reject requests without Authorization header (401)', async () => {
            const res = await request(app).post('/api/orders/create');
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: 'No token provided' });
        });

        it('POST /api/orders/create should reject requests with forged tokens (401)', async () => {
            const res = await request(app)
                .post('/api/orders/create')
                .set('Authorization', 'Bearer forged_token_value_abc');
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: 'Invalid token' });
        });

        it('Accessing admin endpoint without admin token should be forbidden (401, 403, or 404)', async () => {
            const userToken = jwt.sign(
                { id: 'regular_user_1', role: 'user' },
                process.env.JWT_SECRET
            );

            const res = await request(app)
                .get('/api/admin/dashboard')
                .set('Authorization', `Bearer ${userToken}`);

            expect([401, 403, 404]).toContain(res.statusCode);
        });
    });
});
