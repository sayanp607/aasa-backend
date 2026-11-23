const { protect, adminOnly } = require('../../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

describe('Backend Unit Tests - Auth Middleware', () => {
    const JWT_SECRET = 'test_secret_key_123';
    let req, res, next;

    beforeEach(() => {
        process.env.JWT_SECRET = JWT_SECRET;
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('protect middleware', () => {
        it('should return 401 if Authorization header is missing', () => {
            protect(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid or expired', () => {
            req.headers.authorization = 'Bearer invalid_token_xyz';
            protect(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should decode valid JWT and call next()', () => {
            const payload = { id: 'user_123', role: 'user' };
            const token = jwt.sign(payload, JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            protect(req, res, next);

            expect(req.user).toBeDefined();
            expect(req.user.id).toBe('user_123');
            expect(req.user.role).toBe('user');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('adminOnly middleware', () => {
        it('should return 403 if user is not an admin', () => {
            req.user = { id: 'user_123', role: 'user' };
            adminOnly(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() if user is an admin', () => {
            req.user = { id: 'admin_999', role: 'admin' };
            adminOnly(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
