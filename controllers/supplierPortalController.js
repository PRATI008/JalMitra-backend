const { readDb, writeDb } = require('../data/store');

function getDbWithDefaults() {
  const db = readDb();
  if (!db.products) {
    db.products = [
      {
        id: 1,
        productName: '20 Litre RO Water Jar',
        price: 30,
        waterType: ['Normal', 'Cold'],
        capacity: '20L',
        stock: '150',
        image: '/normal-water.png',
        supplierId: 1
      },
      {
        id: 2,
        productName: 'Chilled Mineral Water Jar 20L',
        price: 35,
        waterType: ['Cold'],
        capacity: '20L',
        stock: '85',
        image: '/cold.png',
        supplierId: 1
      },
      {
        id: 3,
        productName: '1 Litre Water Bottle (Box of 12)',
        price: 180,
        waterType: ['Normal'],
        capacity: '1L x 12',
        stock: '45',
        image: '/water-bottle.png',
        supplierId: 1
      }
    ];
  }

  if (!db.registeredSuppliers) {
    db.registeredSuppliers = [
      {
        id: 1,
        businessName: 'Mishra Water Supply',
        name: 'Rajesh Mishra',
        email: 'supplier@jalmitra.com',
        password: 'password123',
        phone: '9876543210',
        location: 'Aliganj, Lucknow',
        address: 'Plot 42, Sector B, Aliganj, Lucknow',
        supplyRange: '5 km',
        waterType: ['Cold', 'Normal'],
        rating: 4.8,
        reviews: 120,
        image: '/profile-info.png'
      }
    ];
  }

  if (!db.supplierNotifications) {
    db.supplierNotifications = [];
  }

  return db;
}

exports.register = (req, res) => {
  const db = getDbWithDefaults();
  const { businessName, name, phone, waterType, location, address, email, password, supplyRange } = req.body;

  if (!businessName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Business name, email, and password are required'
    });
  }

  const existing = db.registeredSuppliers.find(
    s => s.email.toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'A supplier with this email already exists. Please login.'
    });
  }

  const newSupplierId = db.registeredSuppliers.length > 0
    ? Math.max(...db.registeredSuppliers.map(s => s.id)) + 1
    : 1;

  const newSupplier = {
    id: newSupplierId,
    businessName,
    name: name || businessName,
    phone: phone || '',
    waterType: Array.isArray(waterType) ? waterType : ['Normal', 'Cold'],
    location: location || 'Lucknow',
    address: address || '',
    email: email.toLowerCase().trim(),
    password,
    supplyRange: supplyRange || '5 km',
    rating: 5.0,
    reviews: 0,
    image: '/profile-info.png',
    createdAt: new Date().toISOString()
  };

  db.registeredSuppliers.push(newSupplier);

  const existingPublic = db.suppliers.find(s => s.phone === phone);
  if (!existingPublic) {
    db.suppliers.push({
      id: newSupplierId,
      name: businessName,
      tagline: 'Fresh Pure Water Doorstep Delivery',
      location: location || 'Lucknow',
      fullAddress: address || location,
      distance: '1.0 km',
      deliveryTime: '20-30 mins',
      water: Array.isArray(waterType) && waterType.length > 1 ? 'Both' : (waterType[0] || 'Both'),
      price: 30,
      coldPrice: 35,
      normalPrice: 30,
      rating: 5.0,
      ratingCount: 1,
      isVerified: true,
      phone: phone || '+91 98765 43210',
      openTime: '06:00 AM - 10:00 PM',
      features: ['Doorstep Delivery', 'TDS Safe', 'Sanitized Cans']
    });
  }

  writeDb(db);

  res.status(201).json({
    success: true,
    data: newSupplier,
    message: 'Supplier registered successfully'
  });
};

exports.login = (req, res) => {
  const db = getDbWithDefaults();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const supplier = db.registeredSuppliers.find(
    s => s.email.toLowerCase() === cleanEmail && s.password === password
  );

  if (supplier) {
    return res.json({
      success: true,
      data: supplier,
      message: 'Login successful'
    });
  }

  const demoSupplier = db.registeredSuppliers[0];
  if (demoSupplier && password === 'password123') {
    return res.json({
      success: true,
      data: { ...demoSupplier, email: cleanEmail },
      message: 'Demo login successful'
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid email or password'
  });
};

exports.getProfile = (req, res) => {
  const db = getDbWithDefaults();
  const id = Number(req.params.id) || 1;
  const supplier = db.registeredSuppliers.find(s => s.id === id) || db.registeredSuppliers[0];

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier profile not found'
    });
  }

  res.json({ success: true, data: supplier });
};

exports.updateProfile = (req, res) => {
  const db = getDbWithDefaults();
  const id = Number(req.params.id) || 1;
  const index = db.registeredSuppliers.findIndex(s => s.id === id);

  if (index === -1) {
    const updated = { id, ...req.body };
    db.registeredSuppliers.push(updated);
    writeDb(db);
    return res.json({ success: true, data: updated, message: 'Profile created' });
  }

  db.registeredSuppliers[index] = {
    ...db.registeredSuppliers[index],
    ...req.body,
    id
  };

  const publicIndex = db.suppliers.findIndex(s => s.id === id);
  if (publicIndex !== -1) {
    if (req.body.businessName) db.suppliers[publicIndex].name = req.body.businessName;
    if (req.body.location) db.suppliers[publicIndex].location = req.body.location;
    if (req.body.address) db.suppliers[publicIndex].fullAddress = req.body.address;
  }

  writeDb(db);

  res.json({
    success: true,
    data: db.registeredSuppliers[index],
    message: 'Supplier profile updated successfully'
  });
};

exports.getStats = (req, res) => {
  const db = getDbWithDefaults();
  const orders = db.orders || [];

  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const cancelled = orders.filter(o => o.status === 'Cancelled').length;
  const pending = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  const totalRev = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const todayStr = new Date().toLocaleDateString('en-IN');
  const todayOrders = orders.filter(o => o.orderDate === todayStr || !o.orderDate).length;
  const todayEarnings = orders
    .filter(o => (o.orderDate === todayStr || !o.orderDate) && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  res.json({
    success: true,
    data: {
      total: orders.length,
      delivered,
      pending,
      cancelled,
      todayOrders,
      todayEarnings,
      totalRevenue: totalRev
    }
  });
};

exports.getOrders = (req, res) => {
  const db = getDbWithDefaults();
  const { status } = req.query;
  let orders = [...(db.orders || [])];

  if (status && status !== 'All Orders') {
    if (status === 'Pending') {
      orders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
    } else {
      orders = orders.filter(o => o.status === status);
    }
  }

  const formatted = orders.map(o => ({
    id: o.orderId,
    orderId: o.orderId,
    items: `${o.quantity || 1} Cans (${o.waterType || 'Normal'}) | ₹${o.totalPrice || 30}`,
    date: `Placed ${o.orderDate || 'Today'} ${o.orderTime || ''}`,
    status: o.status === 'Delivered' ? 'Delivered' : o.status === 'Cancelled' ? 'Cancelled' : 'Pending',
    rawStatus: o.status,
    customerName: o.userDetails?.name || 'Customer',
    customerMobile: o.userDetails?.mobile || '+91 98765 43210',
    customerAddress: o.userDetails?.currentLocation || o.userDetails?.location || o.userDetails?.address || 'Lucknow',
    waterType: o.waterType,
    quantity: o.quantity,
    totalPrice: o.totalPrice,
    paymentMethod: o.paymentMethod || 'Cash on Delivery',
    raw: o
  }));

  res.json({
    success: true,
    count: formatted.length,
    data: formatted
  });
};

exports.getOrderById = (req, res) => {
  const db = getDbWithDefaults();
  const order = db.orders.find(o => o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
};

exports.updateOrderStatus = (req, res) => {
  const db = getDbWithDefaults();
  const orderId = req.params.id;
  const { status, note } = req.body;

  const index = db.orders.findIndex(o => o.orderId === orderId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  db.orders[index].status = status;
  db.orders[index].updatedAt = new Date().toISOString();
  if (note) db.orders[index].note = note;

  const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (!Array.isArray(db.orders[index].statusHistory)) db.orders[index].statusHistory = [];
  db.orders[index].statusHistory.push({
    status,
    time: nowTime,
    note: note || `Supplier updated order to ${status}`
  });

  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: Date.now(),
    title: `Order #${orderId} ${status}`,
    message: `Your water delivery status changed to "${status}".`,
    time: 'Just now',
    isRead: false,
    orderId
  });

  writeDb(db);

  res.json({
    success: true,
    data: db.orders[index],
    message: `Order status updated to ${status}`
  });
};

exports.getProducts = (req, res) => {
  const db = getDbWithDefaults();
  res.json({
    success: true,
    count: db.products.length,
    data: db.products
  });
};

exports.addProduct = (req, res) => {
  const db = getDbWithDefaults();
  const { productName, price, waterType, capacity, stock, image } = req.body;

  if (!productName || !price) {
    return res.status(400).json({
      success: false,
      message: 'Product name and price are required'
    });
  }

  const newProduct = {
    id: Date.now(),
    productName,
    price: Number(price),
    waterType: Array.isArray(waterType) ? waterType : ['Normal'],
    capacity: capacity || '20L',
    stock: stock || '100',
    image: image || '/normal-water.png',
    supplierId: 1,
    createdAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  writeDb(db);

  res.status(201).json({
    success: true,
    data: newProduct,
    message: 'Product added successfully'
  });
};

exports.updateProduct = (req, res) => {
  const db = getDbWithDefaults();
  const id = Number(req.params.id);
  const index = db.products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    id
  };

  writeDb(db);

  res.json({
    success: true,
    data: db.products[index],
    message: 'Product updated successfully'
  });
};

exports.deleteProduct = (req, res) => {
  const db = getDbWithDefaults();
  const id = Number(req.params.id);
  const initialCount = db.products.length;
  db.products = db.products.filter(p => p.id !== id);

  if (db.products.length === initialCount) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Product deleted successfully' });
};

exports.getReviews = (req, res) => {
  const db = getDbWithDefaults();
  res.json({
    success: true,
    count: db.reviews.length,
    data: db.reviews
  });
};

exports.getCustomers = (req, res) => {
  const db = getDbWithDefaults();
  const orders = db.orders || [];
  const customerMap = {};

  orders.forEach(order => {
    const mobile = order.userDetails?.mobile || '9876543210';
    if (!customerMap[mobile]) {
      customerMap[mobile] = {
        name: order.userDetails?.name || 'Customer',
        mobile,
        address: order.userDetails?.currentLocation || order.userDetails?.location || order.userDetails?.address || 'Lucknow',
        ordersCount: 1,
        totalSpent: Number(order.totalPrice) || 0,
        lastOrderDate: order.orderDate || 'Today'
      };
    } else {
      customerMap[mobile].ordersCount += 1;
      customerMap[mobile].totalSpent += Number(order.totalPrice) || 0;
    }
  });

  (db.users || []).forEach(u => {
    if (!customerMap[u.mobile]) {
      customerMap[u.mobile] = {
        name: u.name,
        mobile: u.mobile,
        address: u.address || u.location || 'Lucknow',
        ordersCount: 1,
        totalSpent: 60,
        lastOrderDate: 'Recent'
      };
    }
  });

  const customersList = Object.values(customerMap);

  res.json({
    success: true,
    count: customersList.length,
    data: customersList
  });
};

exports.getNotifications = (req, res) => {
  const db = getDbWithDefaults();
  res.json({
    success: true,
    count: db.supplierNotifications.length,
    data: db.supplierNotifications
  });
};

exports.markNotificationsRead = (req, res) => {
  const db = getDbWithDefaults();
  db.supplierNotifications = db.supplierNotifications.map(n => ({ ...n, isRead: true }));
  writeDb(db);
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
};

