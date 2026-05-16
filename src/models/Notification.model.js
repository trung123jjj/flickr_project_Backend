const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['reply', 'notice'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  movieId: Number,
  movieTitle: String,
  commentId: String,
  commentContent: String,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
