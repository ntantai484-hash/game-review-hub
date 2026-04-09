const express = require('express');
const router = express.Router();
const gameCtrl = require('../controllers/gameController');

router.get('/', gameCtrl.index);
router.get('/games/:id', gameCtrl.show);

module.exports = router;
