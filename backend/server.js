const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Conditional crypto fix for Bun (does nothing on Node.js)
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  try {
    const { webcrypto } = require("node:crypto");
    globalThis.crypto = webcrypto;
    console.log('✅ Crypto polyfill applied');
  } catch (err) {
    console.log('⚠️ Crypto polyfill failed:', err.message);
  }
}

// ✅ NOW require everything else
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_moves')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const animalRoutes = require('./routes/animals');
const requestRoutes = require('./routes/requests');
const ledgerRoutes = require('./routes/ledger');
const authRoutes = require('./routes/auth');

app.use('/api/animals', animalRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔐 Runtime: ${typeof Bun !== 'undefined' ? 'Bun' : 'Node.js'} ${process.version}`);
}); 