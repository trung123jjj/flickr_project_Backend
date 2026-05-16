const express = require('express');
const router = express.Router();
const { getNotifications, deleteNotification } = require('../controllers/notificationController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, getNotifications);
router.delete('/:id', verifyJWT, deleteNotification);

module.exports = router;
