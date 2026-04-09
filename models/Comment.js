const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  content: { type: String, required: true },
  rating: { type: Number, min: 0, max: 10, required: true },

  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  status: { type: String, enum: ['active', 'deleted'], default: 'active' }
}, { timestamps: true });

// ✅ mỗi user chỉ comment 1 lần / game
CommentSchema.index({ user: 1, game: 1 }, { unique: true });

module.exports = mongoose.model('Comment', CommentSchema);