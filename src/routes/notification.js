const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, deleteNotification, getUnreadCount } = require('../controllers/notificationController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, getNotifications);
router.get('/unread-count', verifyJWT, getUnreadCount);
router.patch('/read-all', verifyJWT, markAllRead);
router.delete('/:id', verifyJWT, deleteNotification);

module.exports = router;
