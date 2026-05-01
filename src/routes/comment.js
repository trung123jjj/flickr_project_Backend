const express = require('express');
const commentController = require('../controllers/commentController');
const verifyJWT = require('../middleware/verifyJWT');
const { validateComment } = require('../middleware/validate');
const router = express.Router();

router.get('/:movieId', commentController.getCommentsByMovie);

router.post('/', verifyJWT, validateComment, commentController.createComment);

router.delete('/:id', verifyJWT, commentController.deleteComment);

module.exports = router;
