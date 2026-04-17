const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const emailRoutes = require('./emailRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const webhookRoutes = require('./webhookRoutes');
const crmRoutes = require('./crmRoutes');
const { protect, authorize } = require('../middleware/auth');
const { getWebhookLogs, getWebhookConfig, updateWebhookConfig } = require('../controllers/webhookController');

router.use('/auth', authRoutes);
router.use('/', emailRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/webhook', webhookRoutes);
router.use('/crm', crmRoutes);

router.get('/webhook-logs', protect, authorize('super_admin', 'admin'), (req, res, next) => {
  // Transfering logic to specific controller method if needed, otherwise using existing logic
  require('../controllers/webhookController').getWebhookLogs(req, res);
});
router.get('/webhook-config', protect, authorize('super_admin', 'admin'), (req, res) => {
  require('../controllers/webhookController').getWebhookConfig(req, res);
});
router.post('/webhook-config', protect, authorize('super_admin', 'admin'), (req, res) => {
  require('../controllers/webhookController').updateWebhookConfig(req, res);
});

module.exports = router;
