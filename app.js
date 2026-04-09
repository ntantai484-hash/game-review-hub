const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const { connectDB } = require('./config/db');
const mongoose = require('mongoose');

const app = express();
// Load environment early so middleware (upload/cloudinary) sees vars
require('dotenv').config();

// Routes (imported but mounted after session is configured)
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');

// Basic middleware that does not depend on DB/session
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Provide safe default template locals so views can render even before
// sessions and flash are configured (avoids ReferenceError in EJS).
app.use((req, res, next) => {
  res.locals.currentUser = null;
  res.locals.success = [];
  res.locals.error = [];
  res.locals.currentPath = req.path;
  res.locals.messages = { success: null, error: null };
  next();
});

/**
 * Start the application: connect to DB, configure session store, mount routes, start HTTP server.
 * Exits the process if DB connection fails.
 */
const startApp = async () => {
  try {
    await connectDB();

    // Configure session store using existing mongoose connection client
    const client = mongoose.connection && typeof mongoose.connection.getClient === 'function'
      ? mongoose.connection.getClient()
      : null;

    if (!client) {
      throw new Error('Missing mongoose client after successful connection');
    }

    app.use(session({
      secret: process.env.SESSION_SECRET || 'devsecret',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ client }),
      cookie: { maxAge: 1000 * 60 * 60 * 24, secure: process.env.NODE_ENV === 'production' }
    }));
    app.use(flash());

    // Attach locals for templates
    app.use((req, res, next) => {
      res.locals.currentUser = req.session ? req.session.user : null;
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

    // Mount application routes
    app.use('/', gameRoutes);
    app.use('/auth', authRoutes);
    app.use('/comments', commentRoutes);
    app.use('/admin', adminRoutes);

    // Start HTTP server using Render-provided PORT
    const PORT = process.env.PORT;
    if (!PORT) {
      console.warn('Warning: process.env.PORT is not set — defaulting to 3000 (not recommended in Render)');
    }
    const listenPort = PORT || 3000;
    const server = app.listen(listenPort, () => {
      const boundPort = server.address() && server.address().port ? server.address().port : listenPort;
      console.log(`Server running on http://localhost:${boundPort}`);
    });
  } catch (err) {
    console.error('Failed to start application due to error:', err && err.message ? err.message : err);
    // In production we want process to exit so Render can mark deploy as failed and restart.
    process.exit(1);
  }
};

app.startApp = startApp;
module.exports = app;
