const User = require('../models/User');

// ================== VIEW ==================
exports.showRegister = (req, res) => {
  res.render('auth/register');
};

exports.showLogin = (req, res) => {
  res.render('auth/login');
};

// ================== REGISTER ==================
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate
    if (!username || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/auth/register');
    }

    if (username.length < 3) {
      req.flash('error', 'Username must be at least 3 characters');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/auth/register');
    }

    // Check tồn tại
    const existing = await User.findOne({ username });
    if (existing) {
      req.flash('error', 'Username already exists');
      return res.redirect('/auth/register');
    }

    // Tạo user
    const user = new User({ username, password });
    await user.save();

    // Login luôn sau khi đăng ký
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    req.flash('success', 'Registration successful');
    req.session.save(err => {
      if (err) console.error('Session save error:', err);
      res.redirect('/');
    });

  } catch (err) {
    console.error('Register error:', err);
    req.flash('error', 'Something went wrong');
    res.redirect('/auth/register');
  }
};

// ================== LOGIN ==================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate
    if (!username || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/auth/login');
    }

    // Tìm user
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/auth/login');
    }

    // Check password
    const match = await user.comparePassword(password);
    if (!match) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/auth/login');
    }

    // Check status (nếu bạn có soft delete / block)
    if (user.status && user.status !== 'active') {
      req.flash('error', 'Account is not active');
      return res.redirect('/auth/login');
    }

    // Lưu session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    req.flash('success', 'Logged in');
    req.session.save(err => {
      if (err) console.error('Session save error:', err);
      res.redirect('/');
    });

  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Something went wrong');
    res.redirect('/auth/login');
  }
};

// ================== LOGOUT ==================
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
};