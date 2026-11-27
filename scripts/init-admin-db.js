const { readDb, writeDb } = require('../data/store');
const db = readDb();

if (!Array.isArray(db.subscriptions) || db.subscriptions.length === 0) {
  db.subscriptions = [
    {
      id: 1,
      name: 'Basic Plan',
      price: 299,
      duration: '1 Month',
      features: '1 Can daily delivery with standard support',
      status: 'Active',
      createdAt: '2026-04-10'
    },
    {
      id: 2,
      name: 'Standard Plan',
      price: 799,
      duration: '3 Months',
      features: 'Priority express delivery and free can sanitization',
      status: 'Active',
      createdAt: '2026-03-15'
    },
    {
      id: 3,
      name: 'Premium Family Plan',
      price: 1499,
      duration: '6 Months',
      features: 'Unlimited priority deliveries, dispenser kit & 24/7 dedicated support',
      status: 'Active',
      createdAt: '2026-01-20'
    }
  ];
}

if (!Array.isArray(db.admins) || db.admins.length === 0) {
  db.admins = [
    {
      id: 1,
      name: 'JalMitra Super Admin',
      email: 'admin@jalmitra.com',
      password: 'admin',
      role: 'superadmin'
    }
  ];
}

if (Array.isArray(db.users)) {
  db.users = db.users.map((u, i) => ({
    id: u.id || i + 1,
    name: u.name || ('Customer ' + (i + 1)),
    mobile: u.mobile || '+91 98765 43210',
    email: u.email || (`user${i + 1}@jalmitra.com`),
    location: u.location || 'Lucknow',
    address: u.address || 'Aliganj, Lucknow',
    joined: u.joined || '12 Apr 2026',
    status: u.status || 'Active'
  }));
}

writeDb(db);
console.log('db.json successfully initialized with subscriptions and admin records!');

