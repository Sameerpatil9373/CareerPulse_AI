const path = require("path");
const Resume = require("../models/resume.model");

const parseResume = require("../services/resumeParser.service");
const { generateFullAnalysis, getFallbackAnalysis } = require("../services/ai.service");

const {
  analyzeSkillsAI,
  calculateATS,
  predictRole
} = require("../services/skillAnalyzer.service");

const { analyzeJobMatch } = require("../services/jobMatch.service");

const getUserId = (req) =>
  req.user?.id ?? req.user?.userId ?? req.user?._id;

/**
 * Upload Resume
 */
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const userId = getUserId(req);
    const filePath = path.resolve(req.file.path);
    const extractedText = await parseResume(filePath);

    console.log("📄 Resume parsed");

    /**
     * Flexible Resume Validation
     */
    const textLower = extractedText.toLowerCase();
    
    // Grouping keywords to allow for synonyms
    const sectionGroups = {
      education: ["education", "university", "college", "degree", "academic", "school"],
      experience: ["experience", "work", "employment", "history", "career", "professional", "internship"],
      projects: ["projects", "portfolio", "github", "deployed", "personal work"],
      skills: ["skills", "technologies", "expertise", "competencies", "tools", "stack"]
    };

    // Check which section groups have at least one match
    const foundSections = Object.keys(sectionGroups).filter(group => 
      sectionGroups[group].some(keyword => textLower.includes(keyword))
    );

    const missingSections = Object.keys(sectionGroups).filter(group => !foundSections.includes(group));

    // Check for other common resume indicators
    const otherKeywords = ["summary", "objective", "contact", "linkedin", "achievements", "certifications", "email", "phone"];
    const matchedOther = otherKeywords.filter(k => textLower.includes(k));

    /**
     * REJECTION LOGIC (Relaxed): 
     * - Must have at least 3 out of 4 major sections (or 2 if the resume is otherwise rich)
     * - OR must have a decent number of other keywords
     * - Minimum length lowered to 300
     */
    const isRichInKeywords = matchedOther.length >= 4;
    const hasEnoughSections = foundSections.length >= 3 || (foundSections.length >= 2 && isRichInKeywords);

    if (!hasEnoughSections || extractedText.trim().length < 300) {
      console.log("❌ Rejected File: Found sections:", foundSections, "Other matches:", matchedOther.length);
      return res.status(400).json({
        message: `Invalid file: This document does not appear to be a complete resume. A professional resume should clearly include sections like Education, Experience, and Skills. Please ensure your headings are clear.`
      });
    }

    /**
     * AI Skill Detection
     */
    const detectedSkills = await analyzeSkillsAI(extractedText);
    console.log("🧠 Detected Skills:", detectedSkills);

    /**
     * Save Resume
     */
    const savedResume = await Resume.create({
      userId,
      fileName: req.file.originalname,
      extractedText,
      skillsDetected: detectedSkills,
      atsScore: calculateATS(detectedSkills, extractedText),
      predictedRole: predictRole(detectedSkills),
      aiInsights: null
    });

    /**
     * Send response immediately (fast UX)
     */
    res.status(201).json({
      data: savedResume,
      message: "Resume uploaded. AI analysis running..."
    });

    /**
     * Background AI Analysis
     */
    setTimeout(async () => {
      try {
        console.log("🚀 Starting background AI analysis...");
        const insights = await generateFullAnalysis(
          extractedText,
          savedResume.predictedRole,
          detectedSkills
        );

        await Resume.findByIdAndUpdate(
          savedResume._id,
          { aiInsights: insights }
        );
        console.log("✅ Background AI insights saved");
      } catch (error) {
        console.log("❌ Background AI generation failed:", error.message);
      }
    }, 2000);

  } catch (error) {
    console.log("❌ Resume upload error:", error.message);
    res.status(500).json({
      message: "Resume upload failed",
      error: error.message
    });
  }
};

/**
 * Get Single Resume by ID
 */
exports.getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume)
      return res.status(404).json({ message: "Resume not found" });

    res.status(200).json({ data: resume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get All Resumes
 */
exports.getAllResumes = async (req, res) => {
  try {
    const userId = getUserId(req);
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ data: resumes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete Resume
 */
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    const resume = await Resume.findOneAndDelete({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * AI Insights
 */
exports.getResumeInsights = async (req, res) => {
  try {
    const { id } = req.params;
    const refresh = req.query.refresh === "true";
    const userId = getUserId(req);

    console.log("📊 AI Insights Requested");
    console.log("Resume ID:", id);

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume)
      return res.status(404).json({ message: "Resume not found" });

    // FIX: Much stronger check! Ensure summary actually has text inside it, not just an empty object from Mongoose.
    const hasInsights = resume.aiInsights && resume.aiInsights.summary && resume.aiInsights.summary.trim().length > 0;

    /**
     * If AI still running (No summary text found)
     */
    if (!hasInsights && !refresh) {
      console.log("⏳ AI is still processing, telling frontend to wait...");
      return res.status(200).json({
        summary: "",
        questions: [],
        explanation: "",
        processing: true // This keeps the loading circle ticking!
      });
    }

    /**
     * Return cached insights if they are completely ready
     */
    if (hasInsights && !refresh) {
      console.log("⚡ Returning cached AI insights");
      return res.status(200).json(resume.aiInsights);
    }

    /**
     * Force refresh or generate if missing
     */
    console.log("🚀 Generating AI insights");
    const insights = await generateFullAnalysis(
      resume.extractedText,
      resume.predictedRole,
      resume.skillsDetected
    );

    resume.aiInsights = insights;
    await resume.save();
    res.status(200).json(insights);

  } catch (error) {
    console.log("❌ AI Insights Error:", error.message);
    res.status(500).json({
      message: "AI analysis failed",
      error: error.message
    });
  }
};

/**
 * Market Job Matching
 */
exports.matchResume = async (req, res) => {
  try {
    // FIX: Brought back the jobDescription extraction so the frontend matcher actually works!
    const { resumeId, jobDescription } = req.body;
    const userId = getUserId(req);

    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume)
      return res.status(404).json({ message: "Resume not found" });

    console.log("📄 Resume Skills:", resume.skillsDetected);

    // Pass jobDescription to the service
    const results = await analyzeJobMatch(
      resume.extractedText,
      resume.skillsDetected,
      jobDescription 
    );

    console.log("🎯 Job Match Results:", results);
    res.status(200).json(results);

  } catch (error) {
    console.log("❌ Job Matching Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};