const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/commentController');
const { ensureAuthenticated } = require('../middleware/auth');

router.post('/', ensureAuthenticated, commentCtrl.create);
router.put('/:id', ensureAuthenticated, commentCtrl.update);
router.delete('/:id', ensureAuthenticated, commentCtrl.delete);
router.post('/:id/like', ensureAuthenticated, commentCtrl.like);
router.post('/:id/dislike', ensureAuthenticated, commentCtrl.dislike);

module.exports = router;
