const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const speechRoutes = require("./routes/speech.routes");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB
connectDB();

// CORS allowed urls
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://speakwise-one.vercel.app",
];
// Middleware
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(new Error("Not allowed by CORS"), false);
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/speech", speechRoutes);

// Server entry point
app.get("/", (req, res) => {
    res.send("Welcome to the SpeakWise");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date(),
        mongodb:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`SpeakWise Server running on port ${PORT}`);
    console.log(`Database: MongoDB`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});