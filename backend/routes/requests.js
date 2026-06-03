const express = require('express');
const router = express.Router();
const TransportRequest = require('../models/TransportRequest');
const Animal = require('../models/Animal');
const TransportLedger = require('../models/TransportLedger');

// GET all requests
router.get('/', async (req, res) => {
  try {
    const requests = await TransportRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET requests by email (for "My Requests")
router.get('/my/:email', async (req, res) => {
  try {
    const requests = await TransportRequest.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new request
router.post('/', async (req, res) => {
  try {
    const request = new TransportRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT approve request
router.put('/:id/approve', async (req, res) => {
  try {
    const request = await TransportRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    const animal = await Animal.findById(request.animalId);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });

    // Check capacity for outward movement
    if (request.direction === 'outward' && animal.capacity < request.quantity) {
      return res.status(400).json({ 
        message: `Insufficient capacity! Only ${animal.capacity} ${animal.unit} available.` 
      });
    }

    // Update capacity
    if (request.direction === 'inward') {
      animal.capacity += request.quantity;
    } else {
      animal.capacity -= request.quantity;
    }
    await animal.save();

    // Update request status
    request.status = 'approved';
    request.approvedAt = new Date();
    await request.save();

    // Create ledger entry
    const ledgerEntry = new TransportLedger({
      requestId: request._id,
      animalId: animal._id,
      animalName: request.animalName,
      direction: request.direction,
      quantity: request.quantity,
      applicant: request.applicant,
      purpose: request.purpose,
      unit: animal.unit
    });
    await ledgerEntry.save();

    res.json({ message: 'Request approved successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT decline request
router.put('/:id/decline', async (req, res) => {
  try {
    const request = await TransportRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'declined';
    await request.save();
    res.json({ message: 'Request declined', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE request
router.delete('/:id', async (req, res) => {
  try {
    const request = await TransportRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // If approved, revert capacity and delete ledger
    if (request.status === 'approved') {
      const animal = await Animal.findById(request.animalId);
      if (animal) {
        if (request.direction === 'outward') {
          animal.capacity += request.quantity;
        } else {
          animal.capacity -= request.quantity;
          if (animal.capacity < 0) animal.capacity = 0;
        }
        await animal.save();
      }
      await TransportLedger.deleteOne({ requestId: request._id });
    }

    await TransportRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;