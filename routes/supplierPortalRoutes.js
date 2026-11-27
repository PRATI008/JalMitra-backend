const express = require('express');
const router = express.Router();
const supplierPortalController = require('../controllers/supplierPortalController');

// Auth & Profile
router.post('/auth/register', supplierPortalController.register);
router.post('/auth/login', supplierPortalController.login);
router.get('/profile/:id', supplierPortalController.getProfile);
router.put('/profile/:id', supplierPortalController.updateProfile);

// Stats
router.get('/stats', supplierPortalController.getStats);

// Orders
router.get('/orders', supplierPortalController.getOrders);
router.get('/orders/:id', supplierPortalController.getOrderById);
router.patch('/orders/:id/status', supplierPortalController.updateOrderStatus);

// Products
router.get('/products', supplierPortalController.getProducts);
router.post('/products', supplierPortalController.addProduct);
router.put('/products/:id', supplierPortalController.updateProduct);
router.delete('/products/:id', supplierPortalController.deleteProduct);

// Reviews, Customers & Notifications
router.get('/reviews', supplierPortalController.getReviews);
router.get('/customers', supplierPortalController.getCustomers);
router.get('/notifications', supplierPortalController.getNotifications);
router.patch('/notifications/mark-read', supplierPortalController.markNotificationsRead);

module.exports = router;
