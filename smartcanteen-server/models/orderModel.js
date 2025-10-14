const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  items: [{
    menuId: { type: mongoose.Schema.Types.Mixed, required: true },
    quantity: { type: Number, default: 1 }
  }],
  totalPrice: Number,
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Completed'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
