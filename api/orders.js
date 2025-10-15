import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Connection pooling for Vercel serverless
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

// Order model (inline for serverless)
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: [
    {
      menuId: { type: mongoose.Schema.Types.Mixed, required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  totalPrice: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    // List all orders
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  }

  if (req.method === 'POST') {
    // Create a new order
    const { userId, items, totalPrice } = req.body;
    if (!userId || !Array.isArray(items) || !totalPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const order = await Order.create({ userId, items, totalPrice });
    return res.status(201).json(order);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
