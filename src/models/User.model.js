const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    avatar_url: {
      type: String,
      default: "https://static.thenounproject.com/png/anonymous-avatar-icon-2631891-512.png",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
