const express = require('express');
const router = express.Router();
const { handleContact } = require('../controllers/contactController');

router.post('/message', handleContact);

module.exports = router;
