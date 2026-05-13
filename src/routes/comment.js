const express = require('express');
const commentController = require('../controllers/commentController');
const verifyJWT = require('../middleware/verifyJWT');
const { validateComment } = require('../middleware/validate');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', commentController.getAllComments);

router.get('/:movieId', commentController.getCommentsByMovie);

router.post('/upload-image', verifyJWT, upload.single('commentImage'), commentController.uploadCommentImage);

router.post('/', verifyJWT, validateComment, commentController.createComment);

router.delete('/:id', verifyJWT, commentController.deleteComment);

module.exports = router;
