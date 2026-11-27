const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../data/store');

// Login or auto-register by mobile
router.post('/login', (req, res) => {
  const { mobile, name, address, location } = req.body;

  if (!mobile || mobile.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit mobile number'
    });
  }

  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const db = readDb();
  let user = db.users.find(u => u.mobile === cleanMobile);

  if (!user) {
    user = {
      mobile: cleanMobile,
      name: name ? name.trim() : `Customer ${cleanMobile.slice(-4)}`,
      address: address || '',
      location: location || 'Lucknow',
      savedAddresses: [
        { id: Date.now(), title: 'Home', address: address || 'Lucknow', isDefault: true }
      ]
    };
    db.users.push(user);
    writeDb(db);
  } else if (name || address || location) {
    if (name) user.name = name.trim();
    if (address) user.address = address.trim();
    if (location) user.location = location.trim();
    writeDb(db);
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: user
  });
});

// GET profile
router.get('/profile/:mobile', (req, res) => {
  const cleanMobile = req.params.mobile.replace(/\D/g, '').slice(-10);
  const db = readDb();
  const user = db.users.find(u => u.mobile === cleanMobile);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// UPDATE profile
router.put('/profile/:mobile', (req, res) => {
  const cleanMobile = req.params.mobile.replace(/\D/g, '').slice(-10);
  const { name, address, location, savedAddresses } = req.body;
  const db = readDb();
  let user = db.users.find(u => u.mobile === cleanMobile);

  if (!user) {
    user = {
      mobile: cleanMobile,
      name: name || 'Valued Customer',
      address: address || '',
      location: location || '',
      savedAddresses: savedAddresses || []
    };
    db.users.push(user);
  } else {
    if (name !== undefined) user.name = name;
    if (address !== undefined) user.address = address;
    if (location !== undefined) user.location = location;
    if (savedAddresses !== undefined) user.savedAddresses = savedAddresses;
  }

  writeDb(db);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

module.exports = router;

