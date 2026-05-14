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
    const { movieId, content, imageUrl, parentCommentId } = req.body;
    const movieIdNum = parseInt(movieId);

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      if (parentComment.movieId !== movieIdNum) {
        return res.status(400).json({ message: "Parent comment does not belong to this movie" });
      }
    }

    const comment = await Comment.create({
      userId: req.user._id,
      movieId: movieIdNum,
      content,
      imageUrl,
      parentCommentId: parentCommentId || null,
    });

    // Populate userId to return username and avatar
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "username avatar_url");

    // Real-time broadcast
    const io = req.app.get("io");
    io.to(`movie:${movieIdNum}`).emit("newComment", populatedComment.toObject());

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

    // Soft delete: keep document for replies, clear content
    await Comment.updateOne(
      { _id: id },
      { $set: { content: '', imageUrl: null, isDeleted: true } }
    );

    const deletedComment = await Comment.findById(id)
      .populate("userId", "username avatar_url");

    // Real-time broadcast
    const io = req.app.get("io");
    if (deletedComment) {
      io.to(`movie:${deletedComment.movieId}`).emit("commentDeleted", deletedComment.toObject());
    }

    res.json({ message: "Comment deleted successfully" });
    logEvents(`User ${req.user._id} soft-deleted comment ${id}`);
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

    const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/comments/${req.file.filename}`;

    res.json({ imageUrl });
    logEvents(`User ${req.user._id} uploaded comment image: ${req.file.filename}`);
  } catch (error) {
    logEvents(`Error uploading comment image: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = comment.likes.some(lid => lid.equals(userId));

    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    const updatedComment = await Comment.findById(id)
      .populate("userId", "username avatar_url");

    // Real-time broadcast
    const io = req.app.get("io");
    io.to(`movie:${updatedComment.movieId}`).emit("commentUpdated", updatedComment.toObject());

    logEvents(`User ${req.user._id} ${alreadyLiked ? 'unliked' : 'liked'} comment ${id}`);
    res.json(updatedComment);
  } catch (error) {
    logEvents(`Error toggling like: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllComments, getCommentsByMovie, createComment, deleteComment, uploadCommentImage, toggleLike };
