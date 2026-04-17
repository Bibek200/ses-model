const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const { sendTextMessage } = require('../services/whatsappService');
const { success, created, error, notFound } = require('../utils/apiResponse');

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return success(res, { campaigns });
  } catch (err) {
    return error(res, err.message);
  }
};

const createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    return created(res, { campaign }, 'Campaign created and scheduled');
  } catch (err) {
    return error(res, err.message);
  }
};

const runCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return notFound(res, 'Campaign not found');

    campaign.status = 'running';
    await campaign.save();

    // Determine target audience
    let targets = [];
    if (campaign.audience === 'leads') {
      targets = await Lead.find({ phone: { $exists: true }, whatsappOptIn: true });
    } else if (campaign.audience === 'customers') {
      targets = await Customer.find({ phone: { $exists: true } });
    } else {
      const leads = await Lead.find({ phone: { $exists: true }, whatsappOptIn: true });
      const customers = await Customer.find({ phone: { $exists: true } });
      targets = [...leads, ...customers];
    }

    // Process broadcast (simulated async for now, but following meta API flow)
    const processBroadcast = async () => {
      let sentCount = 0;
      let failedCount = 0;

      for (const target of targets) {
        try {
          // Meta API allows sending template or text
          await sendTextMessage(target.phone, campaign.message.replace('{{name}}', target.name));
          sentCount++;
        } catch (err) {
          failedCount++;
        }
      }

      await Campaign.findByIdAndUpdate(campaign._id, {
        status: 'completed',
        sentCount,
        failedCount
      });
    };

    // Run in background
    processBroadcast();

    return success(res, null, 'Campaign broadcast started in background');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getCampaigns, createCampaign, runCampaign };
