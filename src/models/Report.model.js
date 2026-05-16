const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      ref: 'User',
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    commentContent: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Report', ReportSchema)
