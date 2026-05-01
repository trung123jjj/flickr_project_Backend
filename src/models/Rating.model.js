const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        movieId: {
            type: Number,
            required: true,
        },

        moviePoster: {
            type: String,
        },

        score: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
        },
        
    },
    { timestamps: true }
);

ratingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
