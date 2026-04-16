const mongoose = require('mongoose');

const webhookConfigSchema = new mongoose.Schema({
  email: {
    type: String,
    default: 'admin@nexus.com',
  },
  domain: {
    type: String,
    default: 'https://api.nexus.com/v1/webhook',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WebhookConfig', webhookConfigSchema);
