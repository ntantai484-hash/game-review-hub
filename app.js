require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const { connectDB } = require('./config/db');
const gameController = require('./controllers/gameController');

const app = express();

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');

// ── Basic middleware ──────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ── View engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Session (MongoStore manages its own connection via mongoUrl) ──────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24, secure: process.env.NODE_ENV === 'production' }
}));
app.use(flash());

// ── Template locals ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser = (req.session && req.session.user) || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  res.locals.messages = {
    success: res.locals.success.length ? res.locals.success[0] : null,
    error:   res.locals.error.length   ? res.locals.error[0]   : null
  };
  next();
});

// ── Lazy Mongoose connection (reused across serverless invocations) ────────────
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// ── Application routes ────────────────────────────────────────────────────────
app.get('/', gameController.index);
app.use('/', gameRoutes);
app.use('/auth', authRoutes);
app.use('/comments', commentRoutes);
app.use('/admin', adminRoutes);

// ── Default export: Express app (function) accepted by Vercel & Render ────────
module.exports = app;
