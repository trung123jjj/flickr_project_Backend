import mongoose from 'mongoose';

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

        updatedAt: {
            type: Date,
            default: Date.now,
        }

    },
    { timestamps: true }
);

ratingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);