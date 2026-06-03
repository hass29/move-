const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const TransportRequest = require('../models/TransportRequest');
const TransportLedger = require('../models/TransportLedger');

// GET all animals
router.get('/', async (req, res) => {
  try {
    const animals = await Animal.find().sort({ id: 1 });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single animal
router.get('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new animal
router.post('/', async (req, res) => {
  try {
    const animal = new Animal(req.body);
    await animal.save();
    res.status(201).json(animal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update animal
router.put('/:id', async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.json(animal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE animal
router.delete('/:id', async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    
    // Delete associated requests and ledger entries
    await TransportRequest.deleteMany({ animalId: req.params.id });
    await TransportLedger.deleteMany({ animalId: req.params.id });
    
    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;