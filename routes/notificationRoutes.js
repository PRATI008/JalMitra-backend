const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../data/store');

// GET all notifications
router.get('/', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    data: db.notifications || []
  });
});

// Mark all as read
router.patch('/mark-all-read', (req, res) => {
  const db = readDb();
  if (db.notifications) {
    db.notifications.forEach(n => { n.isRead = true; });
    writeDb(db);
  }
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

module.exports = router;

