const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  createNewUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateAvatar,
} = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');
const { validateUpdateUser } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.route('/').get(verifyJWT, getAllUsers).post(createNewUser);

router.route('/profile').get(verifyJWT, getUserProfile);

router.route('/avatar').put(verifyJWT, upload.single('avatar'), updateAvatar);

router
  .route('/:username')
  .get(getUser)
  .put(verifyJWT, validateUpdateUser, updateUser)
  .delete(verifyJWT, deleteUser);

module.exports = router;
