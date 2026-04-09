const Game = require('../../models/Game');
const Comment = require('../../models/Comment');
const Genre = require('../../models/Genre');
const User = require('../../models/User');

exports.dashboard = async (req, res) => {
  try {
    const totalGames = await Game.countDocuments({ status: 'active' });
    const totalComments = await Comment.countDocuments({ status: 'active' });
    const totalGenres = await Genre.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments({ status: 'active' });

    res.render('admin/dashboard', {
      totalGames,
      totalComments,
      totalGenres,
      totalUsers
    });

  } catch (err) {
    console.error(err);
    res.redirect('/admin/games');
  }
};