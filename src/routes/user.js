const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  deleteUser,
  updateAvatar,
  changeUsername,
  changePassword,
} = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');
const upload = require('../middleware/upload');

router.route('/profile').get(verifyJWT, getUserProfile);

router.route('/avatar').put(verifyJWT, upload.single('avatar'), updateAvatar);

router.route('/change-username').put(verifyJWT, changeUsername);
router.route('/change-password').put(verifyJWT, changePassword);

router.route('/:username').delete(verifyJWT, deleteUser);

module.exports = router;
