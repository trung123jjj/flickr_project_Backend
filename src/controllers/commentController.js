const Comment = require("../models/Comment.model.js");
const { logEvents } = require("../middleware/logEvents");

const getCommentsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const comments = await Comment.find({ movieId })
      .populate("userId", "username avatar_url")
      .sort({ createdAt: -1 });

    res.json(comments);
    logEvents(`Fetched ${comments.length} comments for movie ${movieId}`);
  } catch (error) {
    logEvents(`Error fetching comments: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { movieId, content, imageUrl } = req.body;

    const comment = await Comment.create({
      userId: req.user._id,
      movieId,
      content,
      imageUrl,
    });

    // Populate userId to return username
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "username");

    res.status(201).json(populatedComment);
    logEvents(`User ${req.user._id} created comment for movie ${movieId}`);
  } catch (error) {
    logEvents(`Error creating comment: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findOne({ _id: id, userId: req.user._id });

    if (!comment) {
      logEvents(`Comment ${id} not found or unauthorized`, "errorLog.txt");
      return res.status(404).json({ message: "Comment not found" });
    }

    await Comment.deleteOne({ _id: id });

    res.json({ message: "Comment deleted successfully" });
    logEvents(`User ${req.user._id} deleted comment ${id}`);
  } catch (error) {
    logEvents(`Error deleting comment: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getCommentsByMovie, createComment, deleteComment };
