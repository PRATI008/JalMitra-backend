const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { initStore } = require('./data/store');
const { getMongoStatus } = require('./config/db');

const supplierRoutes = require('./routes/supplierRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supplierPortalRoutes = require('./routes/supplierPortalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'JalMitra Water Supply Backend',
    database: getMongoStatus(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supplier', supplierPortalRoutes);

// Serve static frontend if built dist exists (single-deployment / hosting ready)
const clientDist = path.join(__dirname, '../jal-mitra/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

initStore().then(() => {
  app.listen(PORT, () => {
    const dbStatus = getMongoStatus();
    console.log(`===============================================`);
    console.log(`🌊 JalMitra Backend Server running on port ${PORT}`);
    console.log(`🗄️  MongoDB Atlas: ${dbStatus.connected ? `Connected (${dbStatus.host})` : 'Fallback (db.json) — set MONGO_URI in .env'}`);
    console.log(`🚀 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`💧 Suppliers API: http://localhost:${PORT}/api/suppliers`);
    console.log(`📦 Orders API:    http://localhost:${PORT}/api/orders`);
    console.log(`===============================================`);
  });
});

