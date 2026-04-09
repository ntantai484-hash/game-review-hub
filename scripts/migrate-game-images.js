require('dotenv').config();
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { cloudinary, configured } = require('../config/cloudinary');

async function main() {
  if (!configured) {
    console.error('Cloudinary not configured. Set CLOUDINARY_* env vars.');
    process.exit(1);
  }

  const mongo = process.env.MONGO_URI;
  if (!mongo) {
    console.error('MONGO_URI not set in env.');
    process.exit(1);
  }

  await mongoose.connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true });
  const Game = require('../models/Game');

  const games = await Game.find({ image: { $exists: true, $ne: null, $ne: '' } });

  for (const g of games) {
    const img = g.image;
    if (!img || typeof img !== 'string') continue;
    if (img.startsWith('http')) continue; // already remote

    const localPath = path.join(__dirname, '..', 'public', 'uploads', img);
    try {
      // ensure file exists
      await fs.access(localPath);
    } catch (err) {
      console.warn(`File not found for game ${g._id}: ${localPath}`);
      continue;
    }

    try {
      console.log(`Uploading ${localPath} -> Cloudinary...`);
      const res = await cloudinary.uploader.upload(localPath, { folder: 'gamehub/games' });
      if (res && res.secure_url) {
        g.image = res.secure_url;
        await g.save();
        console.log(`Updated game ${g._id} image -> ${res.secure_url}`);
        // remove local file
        try { await fs.unlink(localPath); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error(`Failed uploading ${localPath}:`, err.message || err);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
