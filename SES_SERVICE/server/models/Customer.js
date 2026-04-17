const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  address: { type: String },
  convertedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive', 'churned'], default: 'active' },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  tags: [{ type: String }],
  customFields: { type: Map, of: String },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
