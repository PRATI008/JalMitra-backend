const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../data/store');

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================

// POST Admin Login
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const admins = db.admins || [];

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find admin or match standard admin credentials
  const admin = admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());

  const isValid = (admin && admin.password === password) ||
                  (email.trim().toLowerCase() === 'admin@jalmitra.com' && (password === 'admin' || password === 'admin123')) ||
                  (email.trim().toLowerCase() === 'admin' && password === 'admin');

  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const adminData = admin || {
    id: 1,
    name: 'JalMitra Super Admin',
    email: 'admin@jalmitra.com',
    role: 'superadmin'
  };

  res.json({
    success: true,
    message: 'Admin login successful',
    token: 'jalmitra_admin_token_' + Date.now(),
    admin: {
      id: adminData.id,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role
    }
  });
});

// GET Current Admin Profile
router.get('/auth/me', (req, res) => {
  const db = readDb();
  const admin = (db.admins && db.admins[0]) || {
    id: 1,
    name: 'JalMitra Super Admin',
    email: 'admin@jalmitra.com',
    role: 'superadmin'
  };

  res.json({
    success: true,
    data: admin
  });
});

// ==========================================
// 2. DASHBOARD OVERVIEW & STATS
// ==========================================

router.get('/stats', (req, res) => {
  const db = readDb();
  const suppliers = db.suppliers || [];
  const orders = db.orders || [];
  const users = db.users || [];
  const subscriptions = db.subscriptions || [];

  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const approvedSuppliers = suppliers.filter(s => (s.status || 'Approved') === 'Approved').length;
  const pendingSuppliers = suppliers.filter(s => s.status === 'Pending').length;

  const activeUsers = users.filter(u => (u.status || 'Active') === 'Active').length;
  const blockedUsers = users.filter(u => u.status === 'Blocked').length;

  const activeSubscriptions = subscriptions.filter(s => (s.status || 'Active') === 'Active').length;

  res.json({
    success: true,
    data: {
      totalUsers: users.length,
      activeUsers,
      blockedUsers,
      totalSuppliers: suppliers.length,
      approvedSuppliers,
      pendingSuppliers,
      totalProducts: suppliers.length * 2 + 5,
      totalOrders: orders.length,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions,
      recentOrders: orders.slice(0, 10)
    }
  });
});

// ==========================================
// 3. USER MANAGEMENT (CUSTOMERS)
// ==========================================

// GET all users
router.get('/users', (req, res) => {
  const db = readDb();
  const users = db.users || [];
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// POST create user
router.post('/users', (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.users)) db.users = [];

  const { name, mobile, email, location, address, joined } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({
      success: false,
      message: 'Name and Mobile are required'
    });
  }

  const newUser = {
    id: db.users.length > 0 ? Math.max(...db.users.map(u => Number(u.id) || 0)) + 1 : 1,
    name: name.trim(),
    mobile: mobile.trim(),
    email: email ? email.trim() : `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@jalmitra.com`,
    location: location || 'Lucknow',
    address: address || 'Sector B, Aliganj, Lucknow',
    joined: joined || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Active',
    ordersCount: 0
  };

  db.users.unshift(newUser);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
});

// PATCH toggle user status (Active / Blocked)
router.patch('/users/:id/status', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const { status } = req.body;

  const user = (db.users || []).find(u => u.id === id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.status = status || (user.status === 'Active' ? 'Blocked' : 'Active');
  writeDb(db);

  res.json({
    success: true,
    message: `User status updated to ${user.status}`,
    data: user
  });
});

// DELETE user
router.delete('/users/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);

  const initialCount = (db.users || []).length;
  db.users = (db.users || []).filter(u => u.id !== id);

  if (db.users.length === initialCount) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  writeDb(db);
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// ==========================================
// 4. SUPPLIER MANAGEMENT
// ==========================================

// GET all suppliers
router.get('/suppliers', (req, res) => {
  const db = readDb();
  const suppliers = (db.suppliers || []).map(s => ({
    ...s,
    business: s.business || s.tagline || s.name,
    email: s.email || `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@jalmitra.com`,
    mobile: s.phone || s.mobile || '+91 98765 43210',
    status: s.status || 'Approved',
    date: s.date || '15 Mar 2026'
  }));

  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// POST create supplier
router.post('/suppliers', (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.suppliers)) db.suppliers = [];

  const { name, business, phone, mobile, email, location, waterType, date } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Supplier name is required'
    });
  }

  const newSupplier = {
    id: db.suppliers.length > 0 ? Math.max(...db.suppliers.map(s => Number(s.id) || 0)) + 1 : 1,
    name: name.trim(),
    business: business || name.trim(),
    tagline: business || 'Quality Water Supplier',
    location: location || 'Lucknow',
    fullAddress: location || 'Aliganj, Lucknow',
    phone: phone || mobile || '+91 98765 43210',
    email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@jalmitra.com`,
    water: waterType || 'Both',
    price: 30,
    coldPrice: 35,
    normalPrice: 30,
    rating: 4.8,
    ratingCount: 1,
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60',
    status: 'Approved',
    date: date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  db.suppliers.unshift(newSupplier);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: newSupplier
  });
});

// PATCH supplier approval / block status
router.patch('/suppliers/:id/status', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const { status } = req.body;

  const supplier = (db.suppliers || []).find(s => s.id === id);
  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  supplier.status = status || 'Approved';
  writeDb(db);

  res.json({
    success: true,
    message: `Supplier status changed to ${supplier.status}`,
    data: supplier
  });
});

// DELETE supplier
router.delete('/suppliers/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);

  const initialCount = (db.suppliers || []).length;
  db.suppliers = (db.suppliers || []).filter(s => s.id !== id);

  if (db.suppliers.length === initialCount) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  writeDb(db);
  res.json({
    success: true,
    message: 'Supplier deleted successfully'
  });
});

// ==========================================
// 5. SUBSCRIPTION MANAGEMENT
// ==========================================

// GET all subscription plans
router.get('/subscriptions', (req, res) => {
  const db = readDb();
  const subscriptions = db.subscriptions || [];
  res.json({
    success: true,
    count: subscriptions.length,
    data: subscriptions
  });
});

// POST create subscription plan
router.post('/subscriptions', (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.subscriptions)) db.subscriptions = [];

  const { name, price, duration, features, status } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: 'Plan name and price are required'
    });
  }

  const newPlan = {
    id: db.subscriptions.length > 0 ? Math.max(...db.subscriptions.map(s => Number(s.id) || 0)) + 1 : 1,
    name: name.trim(),
    price: Number(price),
    duration: duration || '1 Month',
    features: features || 'Clean RO drinking water supply with free delivery',
    status: status || 'Active',
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.subscriptions.push(newPlan);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Subscription plan created successfully',
    data: newPlan
  });
});

// PATCH toggle subscription plan status
router.patch('/subscriptions/:id/status', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const { status } = req.body;

  const plan = (db.subscriptions || []).find(s => s.id === id);
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Subscription plan not found'
    });
  }

  plan.status = status || (plan.status === 'Active' ? 'Inactive' : 'Active');
  writeDb(db);

  res.json({
    success: true,
    message: `Plan status updated to ${plan.status}`,
    data: plan
  });
});

// DELETE subscription plan
router.delete('/subscriptions/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);

  const initialCount = (db.subscriptions || []).length;
  db.subscriptions = (db.subscriptions || []).filter(s => s.id !== id);

  if (db.subscriptions.length === initialCount) {
    return res.status(404).json({
      success: false,
      message: 'Subscription plan not found'
    });
  }

  writeDb(db);
  res.json({
    success: true,
    message: 'Subscription plan deleted successfully'
  });
});

// ==========================================
// 6. ALL PLATFORM ORDERS FOR ADMIN
// ==========================================

// GET all orders
router.get('/orders', (req, res) => {
  const db = readDb();
  const orders = db.orders || [];
  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// PATCH order status
router.patch('/orders/:id/status', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  const { status } = req.body;

  const order = (db.orders || []).find(o => String(o.orderId) === String(id) || String(o.id) === String(id));
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  order.status = status;
  writeDb(db);

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order
  });
});

module.exports = router;
