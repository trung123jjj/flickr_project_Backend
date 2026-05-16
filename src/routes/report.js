const express = require('express');
const router = express.Router();
const { createReport, getAllReports } = require('../controllers/reportController');
const verifyJWT = require('../middleware/verifyJWT');

router.post('/', verifyJWT, createReport);

router.get('/', verifyJWT, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, getAllReports);

module.exports = router;
