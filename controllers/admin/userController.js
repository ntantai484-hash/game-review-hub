const User = require('../../models/User');

// ================= LIST USERS =================
exports.index = async (req, res) => {
  try {
    const users = await User.find({ status: 'active' })
      .sort({ createdAt: -1 });

    res.render('admin/users/index', { users });

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load users');
    res.redirect('/admin');
  }
};

// ================= CHANGE ROLE =================
exports.changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('/admin/users');
    }

    const user = await User.findById(id);

    if (!user || user.status === 'deleted') {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }

    // ❗ Không cho tự đổi role
    if (req.session.user.id === user._id.toString()) {
      req.flash('error', 'You cannot change your own role');
      return res.redirect('/admin/users');
    }

    user.role = role;
    await user.save();

    req.flash('success', 'User role updated');
    res.redirect('/admin/users');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update role');
    res.redirect('/admin/users');
  }
};

// ================= DELETE USER (SOFT) =================
exports.delete = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }

    // ❗ Không cho tự xóa chính mình
    if (req.session.user.id === user._id.toString()) {
      req.flash('error', 'You cannot delete your own account');
      return res.redirect('/admin/users');
    }

    user.status = 'deleted';
    await user.save();

    req.flash('success', 'User deleted (soft)');
    res.redirect('/admin/users');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete user');
    res.redirect('/admin/users');
  }
};