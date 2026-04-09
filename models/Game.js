const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: { type: String, required: true },

  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],

  publisher: { type: String },
  releaseDate: { type: Date },
  price: { type: String },
  sold: { type: String },
  image: { type: String },

  content: { type: String },

  // ✅ community rating
  rating: { type: Number, min: 0, max: 10, default: null },

  userRatingCount: { type: Number, default: 0 },

  // ✅ external rating
  globalRating: { type: Number, min: 0, max: 10, default: null },
  globalSourceNote: { type: String },

  status: { type: String, enum: ['active', 'deleted'], default: 'active' }

}, { timestamps: true });

// ✅ Index for performance
GameSchema.index({ status: 1, createdAt: -1 });
GameSchema.index({ name: 'text' });

// ================= RATING CALC =================
GameSchema.statics.recalculateRating = async function (gameId) {
  const Comment = mongoose.model('Comment');
  const mongooseTypes = mongoose.Types;

  let matchId;
  try {
    matchId = new mongooseTypes.ObjectId(gameId);
  } catch {
    matchId = gameId;
  }

  const agg = await Comment.aggregate([
    {
      $match: {
        game: matchId,
        status: 'active', // ✅ FIX QUAN TRỌNG
        rating: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$game',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  const avg = agg[0]?.avgRating || 0;
  const count = agg[0]?.count || 0;

  const rounded = Math.round(avg * 10) / 10;

  await this.findByIdAndUpdate(gameId, {
    rating: count === 0 ? null : rounded,
    userRatingCount: count
  });

  return { rating: rounded, count };
};

module.exports = mongoose.model('Game', GameSchema);