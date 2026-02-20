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
const topCorporateRoutes = require("./routes/topCorporateRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

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
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", authRoutes);
app.use("/api", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api", placementRoutes);
app.use("/api", certificationRoutes);
app.use("/api", topCorporateRoutes);
app.use("/api", notificationRoutes);
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

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  
  server.close(() => process.exit(1));
});