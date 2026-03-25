import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
      index: true,
    },
    refreshToken: {
      type: String,
      require: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      require: true,
    },
  },
  {
    timestamps: true,
  },
);

// automatically delete after expired
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Session", sessionSchema);
