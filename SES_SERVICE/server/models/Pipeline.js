const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  color: { type: String, default: '#6366f1' }
});

const pipelineSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Pipeline name is required'], trim: true },
  stages: [stageSchema],
  isDefault: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Pipeline', pipelineSchema);
