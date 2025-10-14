const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role: requestedRole, adminCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    let role = 'user';

    if (requestedRole === 'admin') {
      const expectedCode = process.env.ADMIN_ACCESS_CODE;
      if (expectedCode && expectedCode !== adminCode) {
        return res.status(403).json({ message: 'Invalid admin access code' });
      }
      role = 'admin';
    }

    const newUser = new User({ name, email, password: hashed, role });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const jwtSecret = process.env.JWT_SECRET || 'development-secret';
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not set. Falling back to insecure development secret.');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '1d' });
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
