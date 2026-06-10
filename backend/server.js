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

dotenv.config();
const app = express();

// ✅ Enhanced CORS configuration for frontend connection
const allowedOrigins = [
  'https://move-.vercel.app', 
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`Blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
    console.log(`Allowed origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_moves';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
const animalRoutes = require('./routes/animals');
const requestRoutes = require('./routes/requests');
const ledgerRoutes = require('./routes/ledger');
const authRoutes = require('./routes/auth');

app.use('/api/animals', animalRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/auth', authRoutes);

// ✅ HEALTH CHECK ENDPOINT (REQUIRED for Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Animal Movement Gatepass API',
    version: '1.0.0',
    endpoints: {
      animals: '/api/animals',
      requests: '/api/requests',
      ledger: '/api/ledger',
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ✅ CRITICAL: Use PORT from Railway, listen on 0.0.0.0
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔐 Runtime: ${typeof Bun !== 'undefined' ? 'Bun' : 'Node.js'} ${process.version}`);
});