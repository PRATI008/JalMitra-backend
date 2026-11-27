const mongoose = require('mongoose');

const flexibleOpts = { strict: false, timestamps: true, versionKey: false };

const SupplierSchema = new mongoose.Schema({ id: { type: Number, index: true } }, flexibleOpts);
const RegisteredSupplierSchema = new mongoose.Schema({ id: { type: Number, index: true }, email: { type: String, index: true } }, flexibleOpts);
const UserSchema = new mongoose.Schema({ mobile: { type: String, index: true } }, flexibleOpts);
const OrderSchema = new mongoose.Schema({ orderId: { type: String, index: true } }, flexibleOpts);
const ProductSchema = new mongoose.Schema({ id: { type: Number, index: true } }, flexibleOpts);
const ReviewSchema = new mongoose.Schema({ id: { type: Number, index: true } }, flexibleOpts);
const NotificationSchema = new mongoose.Schema({ id: { type: Number, index: true } }, flexibleOpts);
const SupplierNotificationSchema = new mongoose.Schema({ id: { type: Number, index: true } }, flexibleOpts);
const SubscriptionSchema = new mongoose.Schema({ id: { type: Number, index: true } }, flexibleOpts);

module.exports = {
  Supplier: mongoose.model('Supplier', SupplierSchema),
  RegisteredSupplier: mongoose.model('RegisteredSupplier', RegisteredSupplierSchema),
  User: mongoose.model('User', UserSchema),
  Order: mongoose.model('Order', OrderSchema),
  Product: mongoose.model('Product', ProductSchema),
  Review: mongoose.model('Review', ReviewSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  SupplierNotification: mongoose.model('SupplierNotification', SupplierNotificationSchema),
  Subscription: mongoose.model('Subscription', SubscriptionSchema),
};

