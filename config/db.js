const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/gamehub';
    // show which URI is used (mask password if present)
    const safeUri = uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, (m, p, u, pw) => `${p}${u}:*****@`);
    console.log('Connecting to MongoDB:', safeUri);

    const opts = {
      // recommended options — mongoose 6+ has sensible defaults, but keep explicit here
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    };

    await mongoose.connect(uri, opts);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    // If an env MONGO_URI / DATABASE_URL was provided and connection failed, try falling back to local MongoDB for development
    const envUri = process.env.MONGO_URI || process.env.DATABASE_URL;
    const localUri = 'mongodb://127.0.0.1:27017/gamehub';
    if (envUri && envUri !== localUri) {
      console.log('Attempting fallback to local MongoDB at', localUri);
      try {
        await mongoose.connect(localUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Fallback MongoDB connected (local)');
        return;
      } catch (localErr) {
        console.error('Local MongoDB fallback failed:', localErr && localErr.message ? localErr.message : localErr);
      }
    }
    console.error('Continuing without DB connection — the app will run but data-driven pages may be empty.');
  }
};

module.exports = { connectDB };
