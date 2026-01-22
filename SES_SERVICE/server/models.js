const mongoose = require('mongoose');

// Inquiry Schema
const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  status: {
    type: String,
    enum: ['new', 'read', 'archived'],
    default: 'new',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Webhook Config Schema
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

// Webhook Log Schema
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

const Inquiry = mongoose.model('Inquiry', inquirySchema);
const WebhookConfig = mongoose.model('WebhookConfig', webhookConfigSchema);
const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);

module.exports = {
  Inquiry,
  WebhookConfig,
  WebhookLog,
};
