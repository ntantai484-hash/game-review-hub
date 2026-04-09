const Comment = require('../../models/Comment');
const Game = require('../../models/Game');

// ================= LIST =================
exports.index = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user')
      .populate('game')
      .sort({ createdAt: -1 });

    res.render('admin/comments/index', { comments });

  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
};

// ================= DELETE =================
exports.delete = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.redirect('/admin/comments');

    comment.status = 'deleted';
    await comment.save();

    await Game.recalculateRating(comment.game);

    res.redirect('/admin/comments');

  } catch (err) {
    console.error(err);
    res.redirect('/admin/comments');
  }
};