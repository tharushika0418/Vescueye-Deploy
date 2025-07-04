require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const { wss } = require("./controller/awsIotHandler");
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const MONGO_URI = process.env.MONGO_URI ; 
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json()); 
app.use(cors()); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/users/flap/search/:id', getFlapByPatientId);

// MongoDB connection setup
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start Express Server
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Attach WebSocket Server
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});