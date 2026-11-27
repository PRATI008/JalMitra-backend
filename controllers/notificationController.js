const { readDb, writeDb } = require('../data/store');

exports.getNotifications = (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    data: db.notifications || []
  });
};

exports.markAllRead = (req, res) => {
  const db = readDb();
  if (db.notifications) {
    db.notifications.forEach(n => { n.isRead = true; });
    writeDb(db);
  }
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
};

