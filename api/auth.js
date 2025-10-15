import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { action } = req.query;
    if (action === 'signup') {
      const { name, email, password, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
      }
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hash, role });
      return res.status(201).json({ message: 'Signup successful', user });
    }
    if (action === 'login') {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({ message: 'Login successful', token, user });
    }
    return res.status(400).json({ message: 'Unknown action' });
  }

  res.status(405).json({ message: 'Method not allowed' });
}
