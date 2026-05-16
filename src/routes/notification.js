const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, markAsRead, deleteNotification, getUnreadCount } = require('../controllers/notificationController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', verifyJWT, getNotifications);
router.get('/unread-count', verifyJWT, getUnreadCount);
router.patch('/read-all', verifyJWT, markAllRead);
router.patch('/:id/read', verifyJWT, markAsRead);
router.delete('/:id', verifyJWT, deleteNotification);

module.exports = router;
