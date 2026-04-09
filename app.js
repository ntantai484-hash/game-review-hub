const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const { connectDB } = require('./config/db');

const app = express();
// Load environment early so middleware (upload/cloudinary) sees vars
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');

connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session + Flash
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gamehub' }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(flash());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set locals for templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

// Provide a `messages` object for older templates that expect it
app.use((req, res, next) => {
  res.locals.messages = {
    success: res.locals.success && res.locals.success.length ? res.locals.success[0] : null,
    error: res.locals.error && res.locals.error.length ? res.locals.error[0] : null
  };
  next();
});

// Routes
// Main site routes (home should be at `/`)
app.use('/', gameRoutes);
app.use('/auth', authRoutes);
app.use('/comments', commentRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;
