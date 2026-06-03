const mongoose = require('mongoose');

const transportRequestSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  animalName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  direction: { type: String, enum: ['inward', 'outward'], required: true },
  applicant: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  gate: { type: String, required: true },
  datetime: { type: String, required: true },
  purpose: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  approvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('TransportRequest', transportRequestSchema);