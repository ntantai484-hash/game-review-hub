const mongoose = require('mongoose');
const Game = require('../models/Game');
const Comment = require('../models/Comment');

describe('Game model', () => {
  beforeEach(async () => {
    await Game.deleteMany({});
    await Comment.deleteMany({});
  });

  test('recalculateRating computes average and count from comments', async () => {
    const game = await Game.create({ name: 'T1' });
    await Comment.create({ game: game._id, user: new mongoose.Types.ObjectId(), content: 'c1', rating: 8, status: 'active' });
    await Comment.create({ game: game._id, user: new mongoose.Types.ObjectId(), content: 'c2', rating: 6, status: 'active' });
    const res = await Game.recalculateRating(game._id);
    expect(res.count).toBe(2);
    expect(res.rating).toBe(7.0);
    const g = await Game.findById(game._id);
    expect(g.rating).toBe(7.0);
    expect(g.userRatingCount).toBe(2);
  });
});
