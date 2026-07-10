const path = require("path");
const Resume = require("../models/resume.model");

const parseResume = require("../services/resumeParser.service");
const { generateFullAnalysis, getFallbackAnalysis } = require("../services/aiService");

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
      education: ["education", "university", "college", "degree", "academic", "school", "qualification"],
      experience: ["experience", "work", "employment", "history", "career", "professional", "internship", "position", "responsibility"],
      projects: ["projects", "portfolio", "github", "deployed", "personal work"],
      skills: ["skills", "technologies", "expertise", "competencies", "tools", "stack", "technical"]
    };

    // Check which section groups have at least one match
    const foundSections = Object.keys(sectionGroups).filter(group => 
      sectionGroups[group].some(keyword => textLower.includes(keyword))
    );

    const otherKeywords = ["summary", "objective", "contact", "linkedin", "achievements", "certifications", "email", "phone", "profile", "address", "hobby", "language"];
    const matchedOther = otherKeywords.filter(k => textLower.includes(k));

    // NEW: Real-world resume pattern checks (Regex)
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    const hasEmail = emailPattern.test(extractedText);
    const hasPhone = phonePattern.test(extractedText);

    const hasEnoughSections = foundSections.length >= 2;
    const hasEssentialInfo = hasEmail || hasPhone;
    const hasEnoughContent = extractedText.trim().length >= 300;

    if (!hasEnoughSections || !hasEssentialInfo || !hasEnoughContent) {
      console.log(
        "❌ Rejected File: Sections:",
        foundSections.length,
        "Keywords:",
        matchedOther.length,
        "Email/Phone:",
        hasEssentialInfo,
        "Length:",
        extractedText.trim().length
      );
      return res.status(400).json({
        message:
          "This file doesn't look like a valid resume. Include sections such as Education, Experience, or Skills, add your email or phone number, and use a text-based PDF/DOCX (not a scanned image).",
      });
    }

    const detectedSkills = await analyzeSkillsAI(extractedText);
    console.log("🧠 Detected Skills:", detectedSkills);

    const savedResume = await Resume.create({
      userId,
      fileName: req.file.originalname,
      extractedText,
      skillsDetected: detectedSkills,
      atsScore: calculateATS(detectedSkills, extractedText),
      predictedRole: predictRole(detectedSkills),
      aiInsights: null
    });


    res.status(201).json({
      data: savedResume,
      message: "Resume uploaded. AI analysis running..."
    });

    
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
    return res.status(500).json({
      message: error.message || "Failed to process resume. Please try another PDF or DOCX file.",
    });
  }
};


exports.getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume)
      return res.status(404).json({ message: "Resume not found" });

    res.status(200).json({ data: resume });
  } catch (error) {
    throw error;
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const userId = getUserId(req);
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ data: resumes });
  } catch (error) {
    throw error;
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
    throw error;
  }
};

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

  
    if (!hasInsights && !refresh) {
      console.log("⏳ AI is still processing, telling frontend to wait...");
      return res.status(200).json({
        summary: "",
        questions: [],
        explanation: "",
        processing: true 
      });
    }

    if (hasInsights && !refresh) {
      console.log("⚡ Returning cached AI insights");
      return res.status(200).json(resume.aiInsights);
    }

    
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
    throw error;
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
    throw error;
  }
};