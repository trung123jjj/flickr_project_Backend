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

app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(logger);
app.use(generalLimiter);

app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/rating", require("./routes/rating"));
app.use("/api/users", require("./routes/user"));
app.use("/api/comments", require("./routes/comment"));

app.get("/", (req, res) => {
  res.json({ message: "Flickr Backend đang chạy!" });
});

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Server đang chạy tại port ${process.env.PORT || 8080}`);
    });
  })
  .catch((err) => console.log("Lỗi kết nối:", err));
