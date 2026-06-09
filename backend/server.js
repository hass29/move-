const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check Node.js version
const requiredNodeVersion = 20;
const currentNodeVersion = process.versions.node.split('.')[0];
if (parseInt(currentNodeVersion) < requiredNodeVersion) {
  console.warn(`⚠️ Warning: Node.js ${currentNodeVersion} detected. Recommended version: ${requiredNodeVersion}+`);
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ CRITICAL: MONGODB_URI environment variable is not set!');
  console.error('Please add it in Railway dashboard');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Node version: ${process.version}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received: closing server...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ Connections closed');
      process.exit(0);
    });
  });
});