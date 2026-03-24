const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Flickr Backend đang chạy!" });
});

// Kết nối MongoDB và chạy server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Đã kết nối MongoDB Atlas");
    app.listen(process.env.PORT, () => {
      console.log(`Server đang chạy tại port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("Lỗi kết nối:", err));
