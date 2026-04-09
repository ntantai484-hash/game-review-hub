const express = require('express');
const router = express.Router();
const gameCtrl = require('../controllers/gameController');
const commentCtrl = require('../controllers/admin/commentController');
const genreCtrl = require('../controllers/admin/genreController');
const userCtrl = require('../controllers/admin/userController');
const { ensureAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ensureAdmin, gameCtrl.adminDashboard);
router.get('/games', ensureAdmin, gameCtrl.adminIndex);
router.get('/games/new', ensureAdmin, gameCtrl.newForm);
router.post('/games', ensureAdmin, upload.single('image'), gameCtrl.create);
router.get('/games/:id/edit', ensureAdmin, gameCtrl.editForm);
router.put('/games/:id', ensureAdmin, upload.single('image'), gameCtrl.update);
router.delete('/games/:id', ensureAdmin, gameCtrl.delete);

// Admin comment management
router.get('/comments', ensureAdmin, commentCtrl.index);
router.delete('/comments/:id', ensureAdmin, commentCtrl.delete);

// Admin genre management
router.get('/genres', ensureAdmin, genreCtrl.index);
router.post('/genres', ensureAdmin, genreCtrl.create);
router.delete('/genres/:id', ensureAdmin, genreCtrl.delete);

// Admin user management
router.get('/users', ensureAdmin, userCtrl.index);
router.post('/users/:id/role', ensureAdmin, userCtrl.changeRole);
router.delete('/users/:id', ensureAdmin, userCtrl.delete);

module.exports = router;
