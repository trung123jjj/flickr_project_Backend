import express from 'express'
import { signIn, signOut, SignUp } from '../controllers/authController.js'
const router = express.Router()

// /auth
router.post('/signin', signIn)

router.post('/signup', SignUp)

router.post('/signout', signOut)

export default router
