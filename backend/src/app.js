const express = require("express");
const cors = require("cors");

const resumeRoutes = require("./routes/resume.routes");
const authRoutes = require("./routes/auth.routes");
const practiceRoutes = require('./routes/practiceRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("CareerPulse AI API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use('/api/practice', practiceRoutes);
app.use((err, req, res, next) => {
  console.error("🔥 FULL ERROR:", err);
  res.status(500).json({
    message: err.message || "Internal server error",
    error: err.message,
  });
});

module.exports = app;