const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const emailRoutes = require('./emailRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const webhookRoutes = require('./webhookRoutes');
const { getWebhookLogs, getWebhookConfig, updateWebhookConfig } = require('../controllers/webhookController');

router.use('/auth', authRoutes);
router.use('/', emailRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/webhook', webhookRoutes);

router.get('/webhook-logs', getWebhookLogs);
router.get('/webhook-config', getWebhookConfig);
router.post('/webhook-config', updateWebhookConfig);

module.exports = router;
