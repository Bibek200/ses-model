const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  inquiryId: String,
  url: String,
  status: {
    type: String,
    default: 'success'
  },
  success: Boolean,
  error: String,
  payload: mongoose.Schema.Types.Mixed,
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WebhookLog', webhookLogSchema);
