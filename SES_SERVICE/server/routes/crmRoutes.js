const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const leadController = require('../controllers/leadController');
const customerController = require('../controllers/customerController');
const pipelineController = require('../controllers/pipelineController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const campaignController = require('../controllers/campaignController');
const automationController = require('../controllers/automationController');
const analyticsController = require('../controllers/analyticsController');
const aiController = require('../controllers/aiController');

// Leads Routes
router.route('/leads')
  .get(protect, leadController.getLeads)
  .post(protect, leadController.createLead);

router.route('/leads/:id')
  .get(protect, leadController.getLead)
  .put(protect, leadController.updateLead)
  .delete(protect, leadController.deleteLead);

// Customers Routes
router.route('/customers')
  .get(protect, customerController.getCustomers)
  .post(protect, authorize('super_admin', 'admin'), customerController.createCustomer);

router.route('/customers/:id')
  .get(protect, customerController.getCustomer)
  .put(protect, customerController.updateCustomer);

// Pipeline Routes
router.route('/pipelines')
  .get(protect, pipelineController.getPipelines)
  .post(protect, authorize('super_admin', 'admin'), pipelineController.createPipeline);

router.get('/pipelines/:id/leads', protect, pipelineController.getPipelineLeads);
router.put('/pipelines/leads/:leadId/stage', protect, pipelineController.moveStage);

// Inventory (Phase 2)
router.route('/products')
  .get(protect, productController.getProducts)
  .post(protect, authorize('super_admin', 'admin'), productController.createProduct);

router.put('/products/:id/stock', protect, authorize('super_admin', 'admin'), productController.updateStock);

// Orders (Phase 2)
router.route('/orders')
  .get(protect, orderController.getOrders)
  .post(protect, orderController.createOrder);

router.put('/orders/:id/status', protect, orderController.updateOrderStatus);

// Campaigns (Phase 2)
router.route('/campaigns')
  .get(protect, authorize('super_admin', 'admin'), campaignController.getCampaigns)
  .post(protect, authorize('super_admin', 'admin'), campaignController.createCampaign);

router.post('/campaigns/:id/run', protect, authorize('super_admin', 'admin'), campaignController.runCampaign);

// Automation (Phase 3)
router.post('/automate', protect, automationController.handleAutomation);

// Analytics & AI (Phase 4)
router.get('/analytics/overview', protect, authorize('super_admin', 'admin'), analyticsController.getOverview);
router.post('/ai/score-lead/:id', protect, aiController.scoreLead);

// WhatsApp Direct Send
const { sendTextMessage } = require('../services/whatsappService');
const Lead = require('../models/Lead');

router.post('/whatsapp/send', protect, async (req, res) => {
  try {
    const { phone, message, leadId } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: 'Phone and message are required' });
    }

    const result = await sendTextMessage(phone, message);

    // Update lead's last contacted timestamp
    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, { lastContactedAt: new Date(), status: 'contacted' });
    }

    return res.json({ success: true, data: result, message: 'WhatsApp message sent' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
