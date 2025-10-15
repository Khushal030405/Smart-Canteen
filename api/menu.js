import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

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

const menuSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  image: String,
  available: { type: Boolean, default: true },
});
const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const items = await Menu.find();
    return res.status(200).json(items);
  }

  if (req.method === 'POST') {
    const { itemName, price, category, image, available } = req.body;
    if (!itemName || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const item = await Menu.create({ itemName, price, category, image, available });
    return res.status(201).json(item);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
