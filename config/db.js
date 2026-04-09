const mongoose = require('mongoose');

/**
 * Connect to MongoDB using MONGODB_URI env var.
 * - Uses Mongoose v6+ defaults (no deprecated options).
 * - Throws on failure so caller can decide to exit.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Mask password for logs if present
  const safeUri = uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, (m, p, u, pw) => `${p}${u}:*****@`);
  console.log('Connecting to MongoDB:', safeUri);

  try {
    // Mongoose v6+ uses sensible defaults; include a serverSelectionTimeoutMS for faster failure.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    // Rethrow so caller (deploy script) can exit the process.
    throw err;
  }
};

module.exports = { connectDB };
