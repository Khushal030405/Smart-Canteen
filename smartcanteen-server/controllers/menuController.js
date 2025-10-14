const Menu = require('../models/menuModel');

// Get all menu items
exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new menu item (admin only)
exports.addMenu = async (req, res) => {
  try {
    const newItem = new Menu(req.body);
    await newItem.save();
    res.json({ message: "Menu item added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
