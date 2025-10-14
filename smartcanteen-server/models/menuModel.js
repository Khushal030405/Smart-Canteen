const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  image: String,
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('Menu', menuSchema);
