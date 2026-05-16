const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/reportController');
const verifyJWT = require('../middleware/verifyJWT');

router.post('/', verifyJWT, createReport);

module.exports = router;
