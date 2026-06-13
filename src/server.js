const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const sanitizeMiddleware = require("./middleware/sanitize");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const http = require("http");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const { connectDB } = require("./libs/db");
const User = require("./models/User.model.js");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

const corsOrigin = process.env.CORS_ORIGIN;

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: corsOrigin && corsOrigin !== '*' ? corsOrigin.split(',').map(s => s.trim()) : "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("-hashedPassword");
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log(`[Socket.IO] User ${socket.user?.username} connected: ${socket.id}`);
  if (socket.user) {
    socket.join(`user:${socket.user._id}`);
  }
  socket.on("joinMovie", (movieId) => {
    socket.join(`movie:${movieId}`);
    console.log(`[Socket.IO] ${socket.id} joined movie:${movieId}`);
  });
  socket.on("leaveMovie", (movieId) => {
    socket.leave(`movie:${movieId}`);
  });
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] User ${socket.user?.username} disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set("io", io);

app.use((req, res, next) => {
  console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
  next();
});

app.use(logger);

// Fix Express 5 query getter issue
app.set('query parser', 'simple');

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

// CORS
let corsConfig;
if (corsOrigin && corsOrigin !== '*') {
  corsConfig = { origin: corsOrigin.split(',').map(s => s.trim()), credentials: true };
} else {
  corsConfig = { origin: "*", credentials: false };
}
app.use(cors(corsConfig));

// Security headers
app.use(helmet());

// 🔥 Middleware
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Prevent NoSQL injection
app.use(sanitizeMiddleware());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limit
app.use(generalLimiter);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// 🔥 Routes
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/ratings", require("./routes/rating"));
app.use("/api/users", require("./routes/user"));
app.use("/api/comments", require("./routes/comment"));
app.use("/api/reports", require("./routes/report"));
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/tmdb", require("./routes/tmdb"));

// 🔥 Test route
app.get("/", (req, res) => {
  res.json({ message: "Flickr Backend đang chạy!" });
});

// 🔥 Error handler
app.use(errorHandler);

// 🔥 Connect DB rồi mới start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server đang chạy tại port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });