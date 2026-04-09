const multer = require('multer');
const path = require('path');
const { configured } = require('../config/cloudinary');

let storage;
if (configured) {
  // when using Cloudinary, keep file in memory so controller can upload the buffer
  storage = multer.memoryStorage();
} else {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
  });
}

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'), false);
  cb(null, true);
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
