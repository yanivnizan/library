'use strict';

var express = require('express');
var controller = require('./release.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/upload', controller.upload);
router.delete('/:id', controller.destroy);

module.exports = router;