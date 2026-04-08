import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        username: {
            type: String,
            required: true,
        },

        movieId: {
            type: Number,
            required: true,
        },

        movieTitle: {
            type: String,
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

        review: {
            type: String,
        },

        watchStatus: {
            type: String,
            enum: ['Watched', 'Watching', 'Want to Watch'],
            default: 'watched',
        },

        isFavorite: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

ratingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);