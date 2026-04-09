const mongoose = require('mongoose');
const Game = require('../models/Game');
const Genre = require('../models/Genre');
const { cloudinary, configured: cloudinaryConfigured } = require('../config/cloudinary');

exports.index = async (req, res) => {
  try {
    const perPage = 9;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const q = req.query.q || '';
    const genresSelected = req.query.genres || [];
    const sort = req.query.sort || '';

    const filter = { status: 'active' };

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }

    let genresArr = Array.isArray(genresSelected) ? genresSelected : [genresSelected];
    genresArr = genresArr.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (genresArr.length) {
      filter.genres = { $in: genresArr };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'top') sortObj = { rating: -1 };

    const total = await Game.countDocuments(filter);

    const games = await Game.find(filter)
      .populate('genres')
      .sort(sortObj)
      .skip((page - 1) * perPage)
      .limit(perPage);

    const genres = await Genre.find({ status: 'active' }).sort({ name: 1 });

    res.render('index', {
      games,
      page,
      totalPages: Math.ceil(total / perPage),
      q,
      genres,
      genresSelected: genresArr,
      sort
    });

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load games');
    res.redirect('/');
  }
};

exports.show = async (req, res) => {
  const Comment = require('../models/Comment');

  try {
    const game = await Game.findById(req.params.id).populate('genres');

    if (!game || game.status === 'deleted') {
      req.flash('error', 'Game not found');
      return res.redirect('/');
    }

    const comments = await Comment.find({
      game: game._id,
      status: 'active'
    })
      .populate('user')
      .sort({ createdAt: -1 });

    res.render('games/show', { game, comments });

  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// ================= ADMIN DASHBOARD =================
exports.adminDashboard = async (req, res) => {
  try {
    const User = require('../models/User');
    const Comment = require('../models/Comment');

    const totalGames = await Game.countDocuments({ status: 'active' });
    const totalGenres = await Genre.countDocuments({ status: 'active' });
    const totalComments = await Comment.countDocuments({});
    const totalUsers = await User.countDocuments({ status: 'active' });

    res.render('admin/dashboard', { totalGames, totalGenres, totalComments, totalUsers });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load admin dashboard');
    res.redirect('/');
  }
};

// ================= ADMIN GAMES LIST =================
exports.adminIndex = async (req, res) => {
  try {
    const games = await Game.find().populate('genres').sort({ createdAt: -1 });
    res.render('admin/games/index', { games });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load games');
    res.redirect('/admin');
  }
};

// ================= NEW FORM =================
exports.newForm = async (req, res) => {
  try {
    const genres = await Genre.find({ status: 'active' }).sort({ name: 1 });
    res.render('admin/games/new', { genres });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load form');
    res.redirect('/admin/games');
  }
};

// ================= CREATE =================
exports.create = async (req, res) => {
  try {
    const { name, content, genres = [], publisher, releaseDate, price, sold } = req.body;

    // handle image upload: Cloudinary if configured, otherwise local filename
    let imageUrl;
    if (req.file) {
      if (cloudinaryConfigured && req.file.buffer) {
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(dataUri, { folder: 'gamehub' });
        imageUrl = result.secure_url;
      } else if (req.file.filename) {
        imageUrl = req.file.filename;
      }
    }

    const genresArr = Array.isArray(genres) ? genres.filter(Boolean) : [genres].filter(Boolean);

    const newGame = new Game({
      name,
      content,
      genres: genresArr,
      image: imageUrl,
      publisher: publisher || undefined,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      price: price || undefined,
      sold: sold || undefined,
      status: 'active'
    });

    await newGame.save();

    req.flash('success', 'Game created');
    res.redirect('/admin/games');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create game');
    res.redirect('/admin/games');
  }
};

// ================= EDIT FORM =================
exports.editForm = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('genres');
    if (!game) {
      req.flash('error', 'Game not found');
      return res.redirect('/admin/games');
    }
    const genres = await Genre.find({ status: 'active' }).sort({ name: 1 });
    res.render('admin/games/edit', { game, genres });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load edit form');
    res.redirect('/admin/games');
  }
};

// ================= UPDATE =================
exports.update = async (req, res) => {
  try {
    const { name, content, genres = [], publisher, releaseDate, price, sold } = req.body;

    const game = await Game.findById(req.params.id);
    if (!game) return res.redirect('/admin/games');

    // handle image upload
    if (req.file) {
      if (cloudinaryConfigured && req.file.buffer) {
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(dataUri, { folder: 'gamehub' });
        game.image = result.secure_url;
      } else if (req.file.filename) {
        game.image = req.file.filename;
      }
    }

    game.name = name || game.name;
    game.content = content || game.content;
    game.genres = Array.isArray(genres) ? genres.filter(Boolean) : [genres].filter(Boolean);
    game.publisher = publisher || game.publisher;
    game.releaseDate = releaseDate ? new Date(releaseDate) : game.releaseDate;
    game.price = price || game.price;
    game.sold = sold || game.sold;

    await game.save();

    req.flash('success', 'Game updated');
    res.redirect('/admin/games');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update game');
    res.redirect('/admin/games');
  }
};

// ================= DELETE =================
exports.delete = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.redirect('/admin/games');

    game.status = 'deleted';
    await game.save();

    req.flash('success', 'Game deleted (soft)');
    res.redirect('/admin/games');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete game');
    res.redirect('/admin/games');
  }
};