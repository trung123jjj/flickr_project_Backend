const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  createNewUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUser,
} = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');
const { validateUpdateUser } = require('../middleware/validate');

router.route('/').get(verifyJWT, getAllUsers).post(createNewUser);

router.route('/profile').get(verifyJWT, getUserProfile);

router
  .route('/:username')
  .get(getUser)
  .put(verifyJWT, validateUpdateUser, updateUser)
  .delete(verifyJWT, deleteUser);

module.exports = router;
