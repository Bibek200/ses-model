const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  source: { type: String, enum: ['webhook', 'manual', 'import', 'api'], default: 'manual' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'lost'], default: 'new' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pipeline: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline' },
  pipelineStage: { type: String },
  score: { type: Number, default: 0 },
  tags: [{ type: String }],
  whatsappOptIn: { type: Boolean, default: false },
  lastContactedAt: { type: Date },
  customFields: { type: Map, of: String },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
