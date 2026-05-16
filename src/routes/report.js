const express = require('express');
const router = express.Router();
const { createReport, getAllReports, deleteReport, sendNotice } = require('../controllers/reportController');
const verifyJWT = require('../middleware/verifyJWT');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.post('/', verifyJWT, createReport);

router.get('/', verifyJWT, requireAdmin, getAllReports);

router.post('/notice', verifyJWT, requireAdmin, sendNotice);

router.delete('/:id', verifyJWT, requireAdmin, deleteReport);

module.exports = router;
