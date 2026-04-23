const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar_url: {
      type: String,
      default: "https://static.thenounproject.com/png/anonymous-avatar-icon-2631891-512.png",
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
