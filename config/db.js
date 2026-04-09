const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gamehub';
    // show which URI is used (mask password if present)
    const safeUri = uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, (m, p, u, pw) => `${p}${u}:*****@`);
    console.log('Connecting to MongoDB:', safeUri);
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    console.error('Continuing without DB connection — the app will run but data-driven pages may be empty.');
  }
};

module.exports = { connectDB };
