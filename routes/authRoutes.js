const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/profile/:mobile', authController.getProfile);
router.put('/profile/:mobile', authController.updateProfile);

module.exports = router;
