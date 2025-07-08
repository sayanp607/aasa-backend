const express = require('express');
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser');
const verifyRole = require('../middlewares/verifyRole'); 
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');

router.post('/create-payment-order', verifyUser, paymentController.createPaymentOrder);

router.post('/place-order', verifyUser, orderController.createOrder);

router.post('/place-gift-order', verifyUser, orderController.createGiftOrder);


router.get('/my-orders', verifyUser, orderController.getUserOrders);
router.get('/all-orders', verifyUser, verifyRole('admin'), orderController.getAllOrders); 

router.patch('/update-status/:id', verifyRole('admin'),verifyUser, orderController.updateOrderStatus);

module.exports = router;
