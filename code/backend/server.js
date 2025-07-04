const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const iotRoutes = require("./routes/iotRoutes");
const { verifyToken } = require("./middleware/authMiddleware");

require("dotenv").config();
require("./mqttClient");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//Whitelist all routes under /api/auth/*
app.use((req, res, next) => {
  if (req.path == "/" || req.path.startsWith("/api/auth/")) {
    return next(); // Skip token verification
  }
  verifyToken(req, res, next); // Apply JWT check
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hey guys,Vascueye Backend is Running");
});

//Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));
