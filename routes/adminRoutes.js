const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Auth
router.post('/auth/login', adminController.login);
router.get('/auth/me', adminController.getMe);

// Stats
router.get('/stats', adminController.getStats);

// Users
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Suppliers
router.get('/suppliers', adminController.getSuppliers);
router.post('/suppliers', adminController.createSupplier);
router.patch('/suppliers/:id/status', adminController.updateSupplierStatus);
router.delete('/suppliers/:id', adminController.deleteSupplier);

// Subscriptions
router.get('/subscriptions', adminController.getSubscriptions);
router.post('/subscriptions', adminController.createSubscription);
router.patch('/subscriptions/:id/status', adminController.toggleSubscriptionStatus);
router.delete('/subscriptions/:id', adminController.deleteSubscription);

// Orders
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
