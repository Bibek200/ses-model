const Lead = require('../models/Lead');
const { assignLead } = require('../services/leadAssignmentService');
const { sendTextMessage } = require('../services/whatsappService');
const { success, error } = require('../utils/apiResponse');

/**
 * Handles incoming data from n8n workflows
 */
const handleAutomation = async (req, res) => {
  try {
    const { action, data } = req.body;

    if (action === 'new_lead') {
      const lead = new Lead({
        ...data,
        source: 'webhook'
      });
      
      await assignLead(lead);
      await lead.save();

      // Notify via WhatsApp if automation requested it
      if (data.notifyViaWhatsapp) {
        await sendTextMessage(lead.phone, `A new lead ${lead.name} has been imported via automation.`);
      }

      return success(res, { lead }, 'Automated lead creation successful');
    }

    return error(res, 'Unknown automation action', 400);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { handleAutomation };
