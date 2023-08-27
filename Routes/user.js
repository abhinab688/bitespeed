const express = require('express');
const router = express.Router()

const userController = require('../Controller/user')

router.post('/identify', userController.identify);

module.exports = router;