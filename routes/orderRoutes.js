const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../data/store');

// GET all orders, optional filter by mobile
router.get('/', (req, res) => {
  const { mobile } = req.query;
  const db = readDb();
  let orders = [...db.orders];

  if (mobile) {
    orders = orders.filter(o => o.userDetails && o.userDetails.mobile === mobile);
  }

  // Sort newest first
  orders.sort((a, b) => (b.orderId > a.orderId ? 1 : -1));

  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// GET single order by ID
router.get('/:id', (req, res) => {
  const db = readDb();
  const orderId = req.params.id;
  const order = db.orders.find(o => o.orderId === orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// CREATE new order
router.post('/', (req, res) => {
  const {
    supplier,
    waterType,
    quantity,
    totalPrice,
    pricePerUnit,
    deliveryCharge,
    discount,
    userDetails,
    paymentMethod,
    paymentStatus,
    deliveryType,
    bookingDate,
    bookingTime
  } = req.body;

  if (!supplier || !userDetails || !userDetails.mobile || !userDetails.name) {
    return res.status(400).json({
      success: false,
      message: 'Missing required order details (supplier or customer info)'
    });
  }

  const db = readDb();
  const orderId = `JM${Date.now().toString().slice(-8)}`;
  const now = new Date();
  const orderTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const orderDate = now.toLocaleDateString('en-IN');

  const newOrder = {
    orderId,
    supplier,
    waterType: waterType || 'Normal',
    quantity: Number(quantity) || 1,
    pricePerUnit: pricePerUnit || supplier.price || 30,
    deliveryCharge: deliveryCharge || 0,
    discount: discount || 0,
    totalPrice: totalPrice || (Number(quantity) * (supplier.price || 30)),
    userDetails,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentStatus || (paymentMethod === 'online' ? 'Paid' : 'Pending'),
    deliveryType: deliveryType || 'now',
    bookingDate: deliveryType === 'prebook' ? bookingDate : null,
    bookingTime: deliveryType === 'prebook' ? bookingTime : null,
    status: 'Placed',
    statusHistory: [
      { status: 'Placed', time: orderTime, note: 'Order placed successfully' }
    ],
    deliveryPartner: {
      name: 'Ramesh Yadav',
      phone: '+91 98765 88990',
      vehicle: 'UP 32 DH 6102 (Cargo Loader)'
    },
    orderDate,
    orderTime
  };

  db.orders.unshift(newOrder);

  // Also add a live notification for customer
  db.notifications.unshift({
    id: Date.now(),
    title: `Order #${orderId} Placed!`,
    message: `Your water order with ${supplier.name} has been received.`,
    time: 'Just now',
    isRead: false,
    type: 'order'
  });

  // Push live notification to Supplier Portal
  if (!Array.isArray(db.supplierNotifications)) db.supplierNotifications = [];
  db.supplierNotifications.unshift({
    id: Date.now() + 1,
    title: `New Order #${orderId} 🔔`,
    message: `${userDetails.name} ordered ${newOrder.quantity}x 20L ${newOrder.waterType} Water (₹${newOrder.totalPrice}) • ${newOrder.paymentMethod === 'online' ? 'Paid Online' : 'COD'}`,
    time: 'Just now',
    isRead: false,
    type: 'new_order',
    orderId
  });

  // Also update or add user to users list if not exists
  let user = db.users.find(u => u.mobile === userDetails.mobile);
  if (!user) {
    db.users.push({
      mobile: userDetails.mobile,
      name: userDetails.name,
      address: userDetails.address || '',
      location: userDetails.location || '',
      savedAddresses: [
        { id: Date.now(), title: 'Current Delivery', address: userDetails.address, isDefault: true }
      ]
    });
  }

  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: newOrder
  });
});

// UPDATE order status (Live Tracking simulation & update)
router.patch('/:id/status', (req, res) => {
  const { status, note } = req.body;
  const orderId = req.params.id;
  const db = readDb();
  const order = db.orders.find(o => o.orderId === orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const validStatuses = ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
    });
  }

  const newStatus = status || getNextStatus(order.status);
  order.status = newStatus;

  const now = new Date();
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status: newStatus,
    time,
    note: note || `Status updated to ${newStatus}`
  });

  // Push notification
  db.notifications.unshift({
    id: Date.now(),
    title: `Order #${order.orderId} ${newStatus}`,
    message: `Your order status changed to ${newStatus}.`,
    time: 'Just now',
    isRead: false,
    type: 'order'
  });

  writeDb(db);

  res.json({
    success: true,
    message: `Order status updated to ${newStatus}`,
    data: order
  });
});

// CANCEL order
router.post('/:id/cancel', (req, res) => {
  const { reason } = req.body;
  const orderId = req.params.id;
  const db = readDb();
  const order = db.orders.find(o => o.orderId === orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.status === 'Delivered') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel an order that has already been delivered'
    });
  }

  order.status = 'Cancelled';
  order.cancelReason = reason || 'Cancelled by user';
  const now = new Date();
  order.statusHistory.push({
    status: 'Cancelled',
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    note: order.cancelReason
  });

  if (!Array.isArray(db.supplierNotifications)) db.supplierNotifications = [];
  db.supplierNotifications.unshift({
    id: Date.now(),
    title: `Order #${orderId} Cancelled`,
    message: `Customer cancelled order #${orderId} (${order.cancelReason}).`,
    time: 'Just now',
    isRead: false,
    type: 'cancelled',
    orderId
  });

  writeDb(db);

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

function getNextStatus(curr) {
  const flow = ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
  const idx = flow.indexOf(curr);
  if (idx !== -1 && idx < flow.length - 1) {
    return flow[idx + 1];
  }
  return curr;
}

module.exports = router;

