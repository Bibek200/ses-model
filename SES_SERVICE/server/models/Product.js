const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  sku: { type: String, required: [true, 'SKU is required'], unique: true, trim: true },
  description: { type: String },
  category: { type: String },
  price: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  stockQuantity: { type: Number, required: true, default: 0 },
  lowStockAlert: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
