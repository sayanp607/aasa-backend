const express = require('express');
const router = express.Router();
const verifyRole = require('../middlewares/verifyRole');
const clothController = require('../controllers/clothController');
const upload = require('../middlewares/upload');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

router.post('/add', verifyRole('admin'), upload.single('image'), clothController.createCloth);
router.get('/get', verifyRole('admin'), clothController.getAllCloths);
router.patch('/:id', verifyRole('admin'), upload.single('image'), clothController.updateCloth);
router.delete('/:id', verifyRole('admin'), clothController.deleteCloth);
// anyone can access this route
router.get('/public/all', cacheMiddleware('cloths', 3600), clothController.getAllCloths);

module.exports = router;
