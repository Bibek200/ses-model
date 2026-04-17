const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['broadcast', 'drip', 'promotional'], default: 'broadcast' },
  audience: { type: String, enum: ['leads', 'customers', 'all'], required: true },
  status: { type: String, enum: ['scheduled', 'running', 'completed', 'failed'], default: 'scheduled' },
  templateName: { type: String }, // For Meta Cloud API templates
  message: { type: String },
  scheduledAt: { type: Date },
  sentCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
