const Comment = require('../models/Comment');
const Game = require('../models/Game');

// ================= CREATE =================
exports.create = async (req, res) => {
  if (!req.session.user) {
    req.flash('error', 'You must be logged in to comment');
    return res.redirect('/auth/login');
  }

  const { content, gameId, rating } = req.body;

  if (!content) {
    req.flash('error', 'Comment cannot be empty');
    return res.redirect(`/games/${gameId}`);
  }

  try {
    const r = Number(rating);
    if (Number.isNaN(r) || r < 0 || r > 10) {
      req.flash('error', 'Rating must be 0–10');
      return res.redirect(`/games/${gameId}`);
    }

    // Use an atomic upsert to avoid race conditions and duplicate-key errors.
    const filter = { user: req.session.user.id, game: gameId };
    const update = {
      $setOnInsert: {
        user: req.session.user.id,
        game: gameId,
        content,
        rating: r,
        status: 'active'
      }
    };

    const resRaw = await Comment.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      rawResult: true,
      setDefaultsOnInsert: true
    });

    // rawResult.lastErrorObject.updatedExisting === true -> document already existed
    const alreadyExisted = !!(resRaw && resRaw.lastErrorObject && resRaw.lastErrorObject.updatedExisting);
    if (alreadyExisted) {
      req.flash('error', 'Bạn không thể comment nhiều lần trong 1 bài review');
      return res.redirect(`/games/${gameId}`);
    }

    // New comment inserted, recalculate rating
    await Game.recalculateRating(gameId);

    req.flash('success', 'Comment added');
    res.redirect(`/games/${gameId}`);

  } catch (err) {
    console.error(err);
    // Handle duplicate comment by same user on same game (unique index user+game)
    const isDup = err && (err.code === 11000 || err.code === '11000' || err.name === 'MongoServerError' || (err.errmsg && err.errmsg.indexOf('duplicate key') !== -1) || (err.message && err.message.indexOf('duplicate key') !== -1));
    if (isDup) {
      req.flash('error', 'Bạn không thể comment nhiều lần trong 1 bài review');
      return res.redirect(`/games/${gameId}`);
    }

    req.flash('error', 'Bạn không thể comment nhiều lần trong 1 bài review');
    res.redirect(`/games/${gameId}`);
  }
};

// ================= UPDATE =================
exports.update = async (req, res) => {
  const { id } = req.params;
  const { content, rating } = req.body;

  try {
    const comment = await Comment.findById(id);
    if (!comment || comment.status === 'deleted') {
      req.flash('error', 'Comment not found');
      return res.redirect('back');
    }

    const isOwner = req.session.user?.id === comment.user.toString();
    const isAdmin = req.session.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      req.flash('error', 'Not authorized');
      return res.redirect('back');
    }

    const r = Number(rating);
    if (!content || Number.isNaN(r) || r < 0 || r > 10) {
      req.flash('error', 'Invalid input');
      return res.redirect(`/games/${comment.game}`);
    }

    comment.content = content;
    comment.rating = r;
    await comment.save();

    await Game.recalculateRating(comment.game);

    req.flash('success', 'Updated');
    res.redirect(`/games/${comment.game}`);

  } catch (err) {
    console.error(err);
    res.redirect('back');
  }
};

// ================= DELETE =================
exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.redirect('back');

    const isOwner = req.session.user?.id === comment.user.toString();
    const isAdmin = req.session.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      req.flash('error', 'Not authorized');
      return res.redirect('back');
    }

    comment.status = 'deleted';
    await comment.save();

    await Game.recalculateRating(comment.game);

    req.flash('success', 'Deleted');
    res.redirect(`/games/${comment.game}`);

  } catch (err) {
    console.error(err);
    res.redirect('back');
  }
};

// ================= LIKE =================
exports.like = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.status === 'deleted') return res.sendStatus(404);

    const userId = req.session.user.id;

    const liked = comment.likedBy.map(String).includes(userId);

    if (liked) {
      comment.likedBy = comment.likedBy.filter(u => u.toString() !== userId);
    } else {
      comment.likedBy.push(userId);
      comment.dislikedBy = comment.dislikedBy.filter(u => u.toString() !== userId);
    }

    await comment.save();

    res.json({
      likes: comment.likedBy.length,
      dislikes: comment.dislikedBy.length,
      liked: !liked
    });

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// ================= DISLIKE =================
exports.dislike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.status === 'deleted') return res.sendStatus(404);

    const userId = req.session.user.id;

    const disliked = comment.dislikedBy.map(String).includes(userId);

    if (disliked) {
      comment.dislikedBy = comment.dislikedBy.filter(u => u.toString() !== userId);
    } else {
      comment.dislikedBy.push(userId);
      comment.likedBy = comment.likedBy.filter(u => u.toString() !== userId);
    }

    await comment.save();

    res.json({
      likes: comment.likedBy.length,
      dislikes: comment.dislikedBy.length,
      disliked: !disliked
    });

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};