const express = require('express');
const router = express.Router();
const {
	placeOrder,
	getUserOrders,
	getAllOrders,
	updateOrderStatus
} = require('../controllers/orderController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

// Protected: Place a new order
router.post('/', authMiddleware, placeOrder);

// Protected: Get all orders (admin only)
router.get('/', authMiddleware, requireAdmin, getAllOrders);

// Protected: Update order status (admin only)
router.patch('/:orderId/status', authMiddleware, requireAdmin, updateOrderStatus);

// Protected: Get orders for a user
router.get('/:userId', authMiddleware, getUserOrders);

module.exports = router;
