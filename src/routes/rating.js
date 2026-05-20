const ratingController = require("../controllers/ratingController");
const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const optionalJWT = require('../middleware/optionalJWT');
const router = express.Router();

router
    .get('/movie/:movieId', optionalJWT, ratingController.getMovieRating)
    .post('/', verifyJWT, ratingController.rateMovie)
    .post('/batch', ratingController.getBatchMovieRatings);

module.exports = router;
