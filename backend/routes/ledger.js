const express = require('express');
const router = express.Router();
const TransportLedger = require('../models/TransportLedger');
const Animal = require('../models/Animal');

// GET all ledger entries with filters
router.get('/', async (req, res) => {
  try {
    const { animalId, direction, fromDate, toDate } = req.query;
    let filter = {};

    if (animalId && animalId !== 'all') {
      filter.animalId = animalId;
    }
    if (direction && direction !== 'all') {
      filter.direction = direction;
    }
    if (fromDate) {
      filter.date = { $gte: new Date(fromDate) };
    }
    if (toDate) {
      filter.date = { ...filter.date, $lte: new Date(toDate) };
    }

    const ledger = await TransportLedger.find(filter).sort({ date: 1 });
    
    // Calculate summary
    const totalIn = ledger.filter(e => e.direction === 'inward').reduce((s, e) => s + e.quantity, 0);
    const totalOut = ledger.filter(e => e.direction === 'outward').reduce((s, e) => s + e.quantity, 0);
    
    res.json({ ledger, summary: { totalIn, totalOut, net: totalIn - totalOut } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;