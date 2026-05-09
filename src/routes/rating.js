const ratingController = require("../controllers/ratingController");
const express = require('express');
const { validateRating } = require('../middleware/validate');
const verifyJWT = require('../middleware/verifyJWT');
const optionalJWT = require('../middleware/optionalJWT');
const router = express.Router();

router
    .get('/movie/:movieId', optionalJWT, ratingController.getMovieRating)
    .post('/', verifyJWT, ratingController.rateMovie)
    .get('/user/:movieId', verifyJWT, ratingController.getUserRating)
    .post('/add', verifyJWT, validateRating, ratingController.createRating)
    .get('/get', verifyJWT, ratingController.getAllRatings)
    .delete('/delete', verifyJWT, ratingController.deleteRating)
    .put('/update', verifyJWT, ratingController.updateRating)
    .post('/batch', ratingController.getBatchMovieRatings);

module.exports = router;
