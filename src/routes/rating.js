const ratingController = require("../controllers/ratingController");
const express = require('express');
const { validateRating } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router
    .get('/movie/:movieId', ratingController.getMovieRating)
    .post('/', authenticateToken, ratingController.rateMovie)
    .get('/user/:movieId', authenticateToken, ratingController.getUserRating)
    .post('/add', authenticateToken, validateRating, ratingController.createRating)
    .get('/get', authenticateToken, ratingController.getAllRatings)
    .delete('/delete', authenticateToken, ratingController.deleteRating)
    .put('/update', authenticateToken, ratingController.updateRating)
    .post('/batch', ratingController.getBatchMovieRatings);

module.exports = router;
