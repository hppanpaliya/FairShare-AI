const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

// Import routes
const eventRoutes = require("./routes/events");
const itemRoutes = require("./routes/items");
const peopleRoutes = require("./routes/people");

// Import database connection
const connectDB = require("./config/db");

// Import Socket.IO configuration
const { configureSocket } = require("./config/socket");

// Initialize Express
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Configure Socket.IO
const io = configureSocket(server);
app.set("io", io); // Make io available to routes

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/people", peopleRoutes);

// Serve static assets in production
app.use(express.static("build"));
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/build/index.html");
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
