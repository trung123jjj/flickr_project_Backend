const refreshTokenController = require("../controllers/refreshTokenController.js");
const express = require('express');
const router = express.Router()

// /refresh
router.get('/', refreshTokenController.handleRefreshToken)

module.exports = router;
