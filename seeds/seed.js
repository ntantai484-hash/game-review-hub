require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Game = require('../models/Game');
const Comment = require('../models/Comment');
const Genre = require('../models/Genre');
const fs = require('fs');
const path = require('path');

async function seed() {
  if (process.env.SKIP_SEED === '1') {
    console.log('SKIP_SEED=1 — skipping seeding.');
    return;
  }

  await connectDB();

  console.log('Clearing collections...');
  await Comment.deleteMany({});
  await Game.deleteMany({});
  await User.deleteMany({});
  await Genre.deleteMany({});

  // ================= USERS =================
  console.log('Creating users...');
  const admin = await User.create({
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  });

  const user = await User.create({
    username: 'reader',
    password: 'reader123',
    role: 'user'
  });

  // ================= IMAGES =================
  const uploadsDir = path.join(__dirname, '../public/uploads');
  let uploadFiles = [];

  try {
    uploadFiles = fs.readdirSync(uploadsDir);
  } catch (err) {
    console.warn('No uploads folder found');
  }

  const hasImage = (name) => uploadFiles.includes(name);

  // ================= GENRES =================
  console.log('Creating genres...');

  const genreNames = [
    'RPG',
    'Action',
    'Adventure',
    'Simulation',
    'Metroidvania'
  ];

  const genreMap = {};

  for (const name of genreNames) {
    const g = await Genre.create({ name });
    genreMap[name] = g;
  }

  // ================= GAMES =================
  console.log('Creating games...');

  const gamesData = [
    {
      name: 'Hollow Knight: Silksong',
      genres: ['Metroidvania', 'Action'],
      publisher: 'Team Cherry',
      rating: 9.2,
      image: 'hollow-knight-silksong.jpg'
    },
    {
      name: 'Red Dead Redemption 2',
      genres: ['Action', 'Adventure'],
      publisher: 'Rockstar Games',
      rating: 9.7,
      image: 'rdr2.jpg'
    },
    {
      name: 'Stardew Valley',
      genres: ['Simulation', 'RPG'],
      publisher: 'ConcernedApe',
      rating: 9.0,
      image: 'stardew-valley.jpg'
    }
  ];

  const createdGames = [];

  for (const g of gamesData) {
    const game = await Game.create({
      name: g.name,
      genres: g.genres.map(name => genreMap[name]._id),
      publisher: g.publisher,
      rating: g.rating,
      image: hasImage(g.image) ? g.image : null,
      content: `${g.name} is a great game.`,
      status: 'active'
    });

    createdGames.push(game);
  }

  // ================= COMMENTS =================
  console.log('Creating comments...');

  if (createdGames.length > 0) {
    await Comment.create({
      user: user._id,
      game: createdGames[0]._id,
      content: 'Game rất hay!',
      rating: 9
    });

    await Game.recalculateRating(createdGames[0]._id);
  }

  console.log('✅ Seed completed!');
  console.log('Admin login: admin / admin123');

  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});