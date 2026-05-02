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
            movieId: Number(req.body.movieId),
            movieTitle: req.body.movieTitle,
            moviePoster: req.body.moviePoster,
            score: Number(req.body.score),
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

const getMovieRating = async (req, res) => {
    try {
        const { movieId } = req.params;
        const numericMovieId = Number(movieId);

        const stats = await Rating.aggregate([
            { $match: { movieId: numericMovieId } },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: "$score" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        const averageScore = stats.length > 0 ? parseFloat(stats[0].averageScore.toFixed(1)) : 0;
        const totalRatings = stats.length > 0 ? stats[0].totalRatings : 0;

        let userScore = null;
        if (req.user) {
            const userRating = await Rating.findOne({
                userId: req.user._id,
                movieId: numericMovieId
            });
            userScore = userRating ? userRating.score : null;
        }

        res.json({ averageScore, totalRatings, userScore });
    } catch (error) {
        console.error('Error fetching movie ratings:', error);
        logEvents(`Error fetching movie ratings: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const rateMovie = async (req, res) => {
    try {
        const { movieId, score, moviePoster } = req.body;
        const numericMovieId = Number(movieId);
        const numericScore = Number(score);

        if (isNaN(numericScore) || numericScore < 1 || numericScore > 5) {
            return res.status(400).json({ message: 'Score must be a number between 1 and 5' });
        }

        const rating = await Rating.findOneAndUpdate(
            { userId: req.user._id, movieId: numericMovieId },
            { $set: { score: numericScore, moviePoster: moviePoster || '' } },
            { upsert: true, new: true, runValidators: true }
        );

        logEvents(`User ${req.user._id} rated movie ${numericMovieId} with score ${numericScore}`);
        res.json(rating);
    } catch (error) {
        console.error('Error rating movie:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate rating entry' });
        }
        logEvents(`Error rating movie: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUserRating = async (req, res) => {
    try {
        const { movieId } = req.params;
        const numericMovieId = Number(movieId);

        const rating = await Rating.findOne({
            userId: req.user._id,
            movieId: numericMovieId
        });

        res.json(rating ? { score: rating.score } : null);
    } catch (error) {
        console.error('Error fetching user rating:', error);
        logEvents(`Error fetching user rating: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getBatchMovieRatings = async (req, res) => {
    try {
        const { movieIds } = req.body;

        if (!Array.isArray(movieIds) || movieIds.length === 0) {
            return res.status(400).json({ message: 'movieIds must be a non-empty array' });
        }

        const numericMovieIds = movieIds.map(id => Number(id));

        const stats = await Rating.aggregate([
            { $match: { movieId: { $in: numericMovieIds } } },
            {
                $group: {
                    _id: "$movieId",
                    averageScore: { $avg: "$score" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        const result = {};
        stats.forEach(stat => {
            result[stat._id] = {
                averageScore: parseFloat(stat.averageScore.toFixed(1)),
                totalRatings: stat.totalRatings
            };
        });

        numericMovieIds.forEach(id => {
            if (!result[id]) {
                result[id] = { averageScore: 0, totalRatings: 0 };
            }
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching batch movie ratings:', error);
        logEvents(`Error fetching batch movie ratings: ${error.message}`, 'errorLog.txt');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllRatings,
    getRatingById,
    createRating,
    updateRating,
    deleteRating,
    getMovieRating,
    rateMovie,
    getUserRating,
    getBatchMovieRatings,
};
