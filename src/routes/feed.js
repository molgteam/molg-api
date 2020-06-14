const express = require('express');
const router = express.Router();
const controller = require('../controllers/feed');

router.get('/:id', controller.index);

module.exports = router;
