const Order = require('../models/orderModel');

const ALLOWED_STATUSES = ['Pending', 'Preparing', 'Completed'];

const normalizeStatus = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  const match = ALLOWED_STATUSES.find(
    (status) => status.toLowerCase() === trimmed
  );

  return match || null;
};

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { items, totalPrice, status } = req.body;

    // Debug: log decoded user
    console.log('Decoded user:', req.user);

    // Accept both id and _id for user
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated or token invalid' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (Number.isNaN(Number(totalPrice))) {
      return res.status(400).json({ message: 'Total price is invalid' });
    }

    const normalizedItems = items
      .filter((item) => item && item.menuId)
      .map((item) => ({
        menuId: item.menuId,
        quantity: Number(item.quantity) || 0,
      }))
      .filter((item) => item.quantity > 0);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: 'Order items are invalid' });
    }

    const orderData = {
      userId: req.user.id,
      items: normalizedItems,
      totalPrice: Number(totalPrice),
    };

    if (req.user.role === 'admin' && status) {
      const normalizedStatus = normalizeStatus(status);
      if (normalizedStatus) {
        orderData.status = normalizedStatus;
      }
    }

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders of a user
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get every order (admin only)
exports.getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const normalizedStatus = normalizeStatus(status);
    if (!normalizedStatus) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === normalizedStatus) {
      return res.json({ message: 'Order status unchanged', order });
    }

    order.status = normalizedStatus;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
