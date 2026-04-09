const cloudinary = require('cloudinary').v2;

const configured = Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

if (configured) {
  // If CLOUDINARY_URL is set, cloudinary.config() will pick it up automatically
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
}

module.exports = { cloudinary, configured };
