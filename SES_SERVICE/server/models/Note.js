const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: { type: String, required: [true, 'Note content is required'] },
  type: { type: String, enum: ['call', 'email', 'whatsapp', 'meeting', 'note'], default: 'note' },
  refModel: { type: String, required: true, enum: ['Lead', 'Customer'] },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'refModel' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
