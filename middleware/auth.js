exports.ensureAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  req.flash('error', 'Please login first');
  res.redirect('/auth/login');
};

exports.ensureAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  req.flash('error', 'Admin access required');
  res.redirect('/');
};
