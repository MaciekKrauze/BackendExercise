const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validatePreferences } = require('../middleware/validateUser');
const { requireAuth } = require('../middleware/auth');

router.post('/register', validateRegister, authController.register)
router.post('/login', validateLogin, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getCurrentUser);
router.put('/preferences', requireAuth, validatePreferences, authController.updatePreferences);

module.exports = router;