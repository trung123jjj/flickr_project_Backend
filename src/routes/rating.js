const ratingController = require("../controllers/ratingController");
const express = require('express');
const { validateRating } = require('../middleware/validate');
const router = express.Router();

router
    .post('/add', validateRating, ratingController.createRating)
    .get('/get', ratingController.getAllRatings)
    .delete('/delete', ratingController.deleteRating)
    .put('/update', ratingController.updateRating);

module.exports = router;
