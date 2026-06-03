const mongoose = require('mongoose');

const transportLedgerSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRequest', required: true },
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  animalName: { type: String, required: true },
  direction: { type: String, enum: ['inward', 'outward'], required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  applicant: { type: String, required: true },
  purpose: { type: String, default: '' },
  unit: { type: String, required: true }
});

module.exports = mongoose.model('TransportLedger', transportLedgerSchema);