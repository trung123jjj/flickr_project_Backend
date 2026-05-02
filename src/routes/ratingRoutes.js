const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { validateRating } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.get('/movie/:movieId', ratingController.getMovieRating);
router.post('/', auth, ratingController.rateMovie);
router.get('/user/:movieId', auth, ratingController.getUserRating);

// Keep existing routes
router.post('/add', auth, validateRating, ratingController.createRating);
router.get('/get', auth, ratingController.getAllRatings);
router.delete('/delete', auth, ratingController.deleteRating);
router.put('/update', auth, ratingController.updateRating);

module.exports = router;
