const express = require('express');
const router = express.Router();

// Simple auth endpoints (you can expand this with JWT if needed)
const ADMIN_PASSWORD = 'admin2025';
const LEDGER_PASSWORD = 'animal2025';

router.post('/admin', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Admin access granted' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin password' });
  }
});

router.post('/ledger', (req, res) => {
  const { password } = req.body;
  if (password === LEDGER_PASSWORD) {
    res.json({ success: true, message: 'Ledger access granted' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid ledger password' });
  }
});

module.exports = router;