const express = require('express');
const router = express.Router();
const { receiveWebhook, getWebhookLogs, getWebhookConfig, updateWebhookConfig } = require('../controllers/webhookController');

router.post('/', receiveWebhook);

module.exports = router;
