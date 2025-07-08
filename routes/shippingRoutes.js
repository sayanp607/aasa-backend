const express = require('express');
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser');
const shippingController = require('../controllers/shippingController');

router.post('/add-shipping', verifyUser, shippingController.createShipping);

module.exports = router;
