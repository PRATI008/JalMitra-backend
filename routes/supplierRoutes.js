const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../data/store');

// GET all suppliers with optional search and filters
router.get('/', (req, res) => {
  const { q, waterType, sort } = req.query;
  const db = readDb();
  let suppliers = [...db.suppliers];

  if (q) {
    const query = q.toLowerCase().trim();
    suppliers = suppliers.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.location.toLowerCase().includes(query) ||
      (s.tagline && s.tagline.toLowerCase().includes(query))
    );
  }

  if (waterType && waterType !== 'All') {
    suppliers = suppliers.filter(s => 
      s.water === waterType || s.water === 'Both'
    );
  }

  if (sort === 'rating') {
    suppliers.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'price_asc') {
    suppliers.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    suppliers.sort((a, b) => b.price - a.price);
  }

  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// GET supplier by ID
router.get('/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const supplier = db.suppliers.find(s => s.id === id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  res.json({
    success: true,
    data: supplier
  });
});

// POST new supplier/product
router.post('/', (req, res) => {
  const db = readDb();
  const { name, location, price, water, phone, tagline, features } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: 'Name and price are required'
    });
  }

  const newSupplier = {
    id: db.suppliers.length > 0 ? Math.max(...db.suppliers.map(s => s.id)) + 1 : 1,
    name,
    location: location || 'Lucknow',
    price: Number(price),
    coldPrice: Number(price) + 5,
    normalPrice: Number(price),
    water: water || 'Both',
    phone: phone || '+91 98765 43210',
    distance: '1.5 km',
    deliveryTime: '20-30 mins',
    rating: 4.8,
    ratingCount: 1,
    isVerified: true,
    status: 'Approved',
    tagline: tagline || 'Clean Drinking Water',
    features: features || ['RO Purified', 'Doorstep Delivery']
  };

  db.suppliers.unshift(newSupplier);
  writeDb(db);

  res.status(201).json({
    success: true,
    data: newSupplier,
    message: 'Supplier added successfully'
  });
});

// PUT update supplier
router.put('/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const index = db.suppliers.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  db.suppliers[index] = {
    ...db.suppliers[index],
    ...req.body,
    id
  };

  writeDb(db);

  res.json({
    success: true,
    data: db.suppliers[index],
    message: 'Supplier updated successfully'
  });
});

module.exports = router;

