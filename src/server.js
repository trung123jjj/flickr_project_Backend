const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const { connectDB } = require("./libs/db");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// 🔥 QUAN TRỌNG: fix rate limit khi deploy (Render dùng proxy)
app.set("trust proxy", 1);

// 🔥 Rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔥 CORS (Flutter không cần credentials)
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

// 🔥 Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(logger);
app.use(generalLimiter);

// 🔥 Routes
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/rating", require("./routes/ratingRoutes"));
app.use("/api/users", require("./routes/user"));
app.use("/api/comments", require("./routes/comment"));

// 🔥 Test route
app.get("/", (req, res) => {
  res.json({ message: "Flickr Backend đang chạy!" });
});

// 🔥 Error handler
app.use(errorHandler);

// 🔥 Connect DB rồi mới start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });