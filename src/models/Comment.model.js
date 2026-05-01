const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        movieId: {
            type: Number,
            required: true,
        },
        content: {
            type: String,
            maxlength: 500,
            required: function() {
                return !this.imageUrl;
            }
        },
        imageUrl: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Comment", commentSchema);
