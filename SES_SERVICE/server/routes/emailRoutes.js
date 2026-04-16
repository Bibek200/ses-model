const express = require('express');
const router = express.Router();
const { sendEmailEndpoint } = require('../controllers/emailController');

router.post('/send-email', sendEmailEndpoint);

module.exports = router;
