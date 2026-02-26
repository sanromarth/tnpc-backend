const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRouter");
const placementRoutes = require("./routes/placementRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const corporateRoutes = require("./routes/corporateRoutes");
const contactRoutes = require("./routes/contactRoutes");


const app = express();
connectDB();
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("combined"));
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use("/api/", apiLimiter);

const defaultOrigins = [
    "https://tnpc-portal.vercel.app",
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];
const allowedOrigins = process.env.CORS_ORIGINS
    ? [...new Set([...process.env.CORS_ORIGINS.split(","), ...defaultOrigins])]
    : defaultOrigins;
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", authRoutes);
app.use("/api", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api", placementRoutes);
app.use("/api", certificationRoutes);
app.use("/api", notificationRoutes);
app.use("/api", trainingRoutes);
app.use("/api", corporateRoutes);
app.use("/api", contactRoutes);
app.get("/", (req, res) => {
  res.send("TNPC Backend Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});


app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "supersecretkey123") {
  console.warn("⚠️  WARNING: JWT_SECRET is not set or uses default value. Set a strong secret in production!");
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});