const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'deleted'], default: 'active' }
}, { timestamps: true });

// ✅ Unique only when active
GenreSchema.index(
  { name: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('Genre', GenreSchema);