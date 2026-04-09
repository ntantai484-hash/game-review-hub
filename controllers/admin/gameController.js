const Game = require('../../models/Game');
const Genre = require('../../models/Genre');

// LIST
exports.index = async (req, res) => {
  const games = await Game.find()
    .populate('genres')
    .sort({ createdAt: -1 });

  res.render('admin/index', { games });
};

// NEW FORM
exports.newForm = async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.render('admin/new', { genres });
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, genres, rating, publisher, releaseDate, price, sold, content, globalRating, globalSourceNote } = req.body;

    if (!name || name.length < 2) {
      req.flash('error', 'Invalid name');
      return res.redirect('/admin/games/new');
    }

    const game = new Game({
      name,
      genres: Array.isArray(genres) ? genres : [genres],
      rating,
      publisher,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      price,
      sold,
      content,
      image: req.file ? req.file.filename : null,
      globalRating,
      globalSourceNote
    });

    await game.save();

    req.flash('success', 'Created');
    res.redirect('/admin/games');

  } catch (err) {
    console.error(err);
    res.redirect('/admin/games');
  }
};

// EDIT FORM
exports.editForm = async (req, res) => {
  const game = await Game.findById(req.params.id).populate('genres');
  const genres = await Genre.find().sort({ name: 1 });

  res.render('admin/edit', { game, genres });
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const update = {
      ...req.body,
      genres: Array.isArray(req.body.genres) ? req.body.genres : [req.body.genres]
    };

    if (req.file) update.image = req.file.filename;

    await Game.findByIdAndUpdate(req.params.id, update);

    req.flash('success', 'Updated');
    res.redirect('/admin/games');

  } catch (err) {
    console.error(err);
    res.redirect('/admin/games');
  }
};

// DELETE (soft)
exports.delete = async (req, res) => {
  await Game.findByIdAndUpdate(req.params.id, { status: 'deleted' });
  res.redirect('/admin/games');
};