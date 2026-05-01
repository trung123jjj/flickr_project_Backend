const Rating = require('../models/Rating.model.js');
const { logEvents } = require('../middleware/logEvents');

const getAllRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ userId: req.user._id });
        logEvents(`User ${req.user._id} fetched all ratings`);
        res.json(ratings);
    } catch (error) {
        console.error('Error fetching ratings:', error);
        logEvents(`Error fetching ratings: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getRatingById = async (req, res) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findOne({ _id: id, userId: req.user._id });

        if (!rating) {
            logEvents(`Rating with id ${id} not found for user ${req.user._id}`, 'errorLog.txt');
            return res.status(404).json({ message: 'Rating not found' });
        }

        logEvents(`User ${req.user._id} fetched rating with id ${id}`);
        res.json(rating);
    } catch (error) {
        console.error('Error fetching rating:', error);
        logEvents(`Error fetching rating: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createRating = async (req, res) => {
    try {
        const ratingData = {
            userId: req.user._id,
            username: req.user.username || req.user.name || 'Unknown',
            movieId: req.body.movieId,
            movieTitle: req.body.movieTitle,
            moviePoster: req.body.moviePoster,
            score: req.body.score,
            review: req.body.review,
            watchStatus: req.body.watchStatus,
            isFavorite: req.body.isFavorite,
        };

        const rating = await Rating.create(ratingData);
        logEvents(`User ${req.user._id} created a new rating with id ${rating._id}`);
        res.status(201).json(rating);
    } catch (error) {
        console.error('Error creating rating:', error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'You already rated this movie' });
        }

        logEvents(`Error creating rating: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateRating = async (req, res) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findOne({ _id: id, userId: req.user._id });

        if (!rating) {
            logEvents(`Rating with id ${id} not found for user ${req.user._id}`, 'errorLog.txt');
            return res.status(404).json({ message: 'Rating not found' });
        }

        const allowedUpdates = ['movieTitle', 'moviePoster', 'score', 'review', 'watchStatus', 'isFavorite'];
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                rating[field] = req.body[field];
            }
        });

        await rating.save();
        logEvents(`User ${req.user._id} updated rating with id ${id}`);
        res.json(rating);
    } catch (error) {
        console.error('Error updating rating:', error);
        logEvents(`Error updating rating: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!rating) {
            logEvents(`Rating with id ${id} not found for user ${req.user._id}`, 'errorLog.txt');
            return res.status(404).json({ message: 'Rating not found' });
        }

        logEvents(`User ${req.user._id} deleted rating with id ${id}`);
        res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error('Error deleting rating:', error);
        logEvents(`Error deleting rating: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllRatings,
    getRatingById,
    createRating,
    updateRating,
    deleteRating,
};
