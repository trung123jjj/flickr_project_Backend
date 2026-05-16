const express = require('express');
const { signIn, signOut, SignUp } = require('../controllers/authController');
const { handleRefreshToken } = require('../controllers/refreshTokenController');
const { validateSignup, validateSignin } = require('../middleware/validate');
const router = express.Router();

router.post('/signin', validateSignin, signIn);

router.post('/signup', validateSignup, SignUp);

router.post('/signout', signOut);

router.post('/refresh', handleRefreshToken);

module.exports = router;
