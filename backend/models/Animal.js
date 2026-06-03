const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  capacity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: 'individuals' },
  age: { type: String, required: true },
  health: { type: String, required: true, default: 'Unknown' }
}, { timestamps: true });

module.exports = mongoose.model('Animal', animalSchema);