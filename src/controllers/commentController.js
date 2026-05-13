const Comment = require("../models/Comment.model.js");
require("../models/User.model.js");
const { logEvents } = require("../middleware/logEvents");
const path = require("path");

const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("userId", "username avatar_url")
      .sort({ createdAt: -1 });
    res.json(comments);
    logEvents(`Fetched all ${comments.length} comments`);
  } catch (error) {
    logEvents(`Error fetching all comments: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCommentsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movieIdNum = parseInt(movieId); // Chuyển sang number

    console.log('Fetching comments for movieId:', movieIdNum); // Debug log

    const comments = await Comment.find({ movieId: movieIdNum })
      .populate("userId", "username avatar_url")
      .sort({ createdAt: -1 });

    console.log(`Found ${comments.length} comments`);
    res.json(comments);
    logEvents(`Fetched ${comments.length} comments for movie ${movieIdNum}`);
  } catch (error) {
    logEvents(`Error fetching comments: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const createComment = async (req, res) => {
  try {
    const { movieId, content, imageUrl } = req.body;
    const movieIdNum = parseInt(movieId);

    const comment = await Comment.create({
      userId: req.user._id,
      movieId: movieIdNum,
      content,
      imageUrl,
    });

    // Populate userId to return username and avatar
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "username avatar_url");

    res.status(201).json(populatedComment);
    logEvents(`User ${req.user._id} created comment for movie ${movieId}`);
  } catch (error) {
    logEvents(`Error creating comment: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
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
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadCommentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select an image file" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/comments/${req.file.filename}`;

    res.json({ imageUrl });
    logEvents(`User ${req.user._id} uploaded comment image: ${req.file.filename}`);
  } catch (error) {
    logEvents(`Error uploading comment image: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllComments, getCommentsByMovie, createComment, deleteComment, uploadCommentImage };
