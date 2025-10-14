const express = require('express');
const router = express.Router();
const { getMenu, addMenu } = require('../controllers/menuController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

// Public: Get all menu items
router.get('/', getMenu);

// Protected: Add new menu item (only admin)
router.post('/', authMiddleware, requireAdmin, addMenu);

module.exports = router;
