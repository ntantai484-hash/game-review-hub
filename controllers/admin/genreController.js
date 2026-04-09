const Genre = require('../../models/Genre');
const Game = require('../../models/Game');

// ================= LIST =================
exports.index = async (req, res) => {
  try {
    const genres = await Genre.find({ status: 'active' })
      .sort({ name: 1 });

    res.render('admin/genres/index', { genres });

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load genres');
    res.redirect('/admin');
  }
};

// ================= CREATE =================
exports.create = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      req.flash('error', 'Name required');
      return res.redirect('/admin/genres');
    }

    // Normalize
    name = name.trim();

    if (name.length < 2) {
      req.flash('error', 'Name too short');
      return res.redirect('/admin/genres');
    }

    // Check duplicate (case-insensitive)
    const existing = await Genre.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
      status: 'active'
    });

    if (existing) {
      req.flash('error', 'Genre already exists');
      return res.redirect('/admin/genres');
    }

    await Genre.create({ name });

    req.flash('success', 'Genre created');
    res.redirect('/admin/genres');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create genre');
    res.redirect('/admin/genres');
  }
};

// ================= DELETE =================
exports.delete = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      req.flash('error', 'Genre not found');
      return res.redirect('/admin/genres');
    }

    // ❗ Check đang được dùng không
    const used = await Game.exists({ genres: genre._id });

    if (used) {
      req.flash('error', 'Cannot delete: genre is used by games');
      return res.redirect('/admin/genres');
    }

    genre.status = 'deleted';
    await genre.save();

    req.flash('success', 'Genre deleted (soft)');
    res.redirect('/admin/genres');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete genre');
    res.redirect('/admin/genres');
  }
};