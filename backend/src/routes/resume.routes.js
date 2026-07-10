const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const auth = require("../middleware/auth.middleware");
const { uploadResume, getAllResumes, matchResume, getResumeInsights, getResumeById, deleteResume } = require("../controllers/resume.controller");

router.post("/upload", auth, (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "File upload failed. Use PDF or DOCX only.",
      });
    }
    next();
  });
}, uploadResume);
router.get("/all", auth, getAllResumes);
router.get("/:id", auth, getResumeById);
router.delete("/:id", auth, deleteResume);
router.post("/match", auth, matchResume);
router.get("/insights/:id", auth, getResumeInsights); // Consolidated endpoint

module.exports = router;