const { uniqLower, canonicalizeSkill } = require("../utils/skillNormalization");

/**
 * Common technical skills dictionary
 */
const COMMON_SKILLS = [
  "html","css","javascript","react","vue","angular",
  "node","node.js","express","mongodb","mysql","sql",
  "java","python","c++","bootstrap","git","github",
  "postman","rest api","docker","kubernetes","aws",
  "machine learning","tensorflow","pytorch","pandas",
  "selenium","testing","automation","excel","tableau",
  // Added modern stack tools to fix missing detections
  "prisma", "postgres", "postgresql", "tailwind", "sass", 
  "typescript", "next.js", "firebase", "django", "flask", "php"
];

/**
 * Technology stack detection
 */
const STACK_MAP = {
  "mern": ["mongodb","express","react","node","javascript"],
  "software tester": ["testing","selenium","automation"],
  "qa": ["testing","selenium","automation"],
  "data analyst": ["sql","excel","tableau"]
};

/**
 * Skill detection (dictionary + stack logic)
 */
const analyzeSkillsAI = async (text) => {
  const lowerText = text.toLowerCase();
  let detectedSkills = [];

  /**
   * Detect stacks like MERN
   */
  for (const stack in STACK_MAP) {
    if (lowerText.includes(stack)) {
      detectedSkills.push(...STACK_MAP[stack]);
    }
  }

  /**
   * Detect skills directly from resume text
   * Improved matching: catch "React JS" and "Node JS" by removing spaces and dots
   */
  const cleanText = lowerText.replace(/[\s.]/g, "");
  const textSkills = COMMON_SKILLS.filter(skill => {
    const cleanSkill = skill.replace(/[\s.]/g, "");
    return lowerText.includes(skill) || cleanText.includes(cleanSkill);
  });

  detectedSkills.push(...textSkills);

  console.log("🧠 Detected Skills:", detectedSkills);

  return enforceImplicitLogic(detectedSkills);
};

/**
 * Skill normalization + logic
 */
const enforceImplicitLogic = (skills) => {
  const normalized = uniqLower(
    skills.map(canonicalizeSkill)
  );

  /**
   * PROBLEM 3 FIX: React/Node implies JavaScript
   */
  const jsFoundations = ["react", "node", "node.js", "express", "next.js", "vue", "angular"];
  if (normalized.some(s => jsFoundations.includes(s))) {
    if (!normalized.includes("javascript")) normalized.push("javascript");
  }

  /**
   * React implies frontend stack
   */
  if (normalized.includes("react")) {
    if (!normalized.includes("html")) normalized.push("html");
    if (!normalized.includes("css")) normalized.push("css");
  }

  /**
   * MySQL implies SQL
   */
  if (normalized.includes("mysql") || normalized.includes("postgres")) {
    if (!normalized.includes("sql")) normalized.push("sql");
  }

  // Problem 4: Responsive UI Inference
  if (normalized.some(s => ["react", "tailwind", "bootstrap", "css", "frontend"].includes(s))) {
    if (!normalized.includes("responsive ui")) normalized.push("responsive ui");
  }

  return normalized.slice(0, 20);
};

/**
 * ATS Score calculation - Dynamic Distribution
 */
const calculateATS = (skills, text) => {
  const finalSkills = enforceImplicitLogic(skills);
  const textLower = text.toLowerCase();
  let score = 20; // Lower base score for more variety

  // Skills Score (0-35)
  const skillCount = finalSkills.length;
  if (skillCount >= 18) score += 35;
  else if (skillCount >= 12) score += 25;
  else if (skillCount >= 8) score += 15;
  else if (skillCount >= 4) score += 8;

  // Experience Score (0-20)
  const experienceCount = (textLower.match(/experience|internship|work/g) || []).length;
  if (experienceCount >= 5) score += 20;
  else if (experienceCount >= 2) score += 10;
  else if (experienceCount >= 1) score += 5;

  // Projects Score (0-20)
  const projectCount = (textLower.match(/project|github|deployed/g) || []).length;
  if (projectCount >= 5) score += 20;
  else if (projectCount >= 3) score += 12;
  else if (projectCount >= 1) score += 6;

  // Formatting & Keywords (0-10)
  const extraKeywords = ["education", "linkedin", "contact", "summary", "objective", "certifications"];
  const matchedExtra = extraKeywords.filter(k => textLower.includes(k)).length;
  score += matchedExtra * 1.5;

  // Final capping
  return Math.min(Math.round(score), 88); // Cap slightly higher but keep it realistic
};

/**
 * Role prediction
 */
const predictRole = (skills) => {
  const s = enforceImplicitLogic(skills);

  if (s.includes("react") && (s.includes("node") || s.includes("node.js")))
    return "Full Stack Developer";
  if (s.includes("react"))
    return "Frontend Developer";
  if (s.includes("node") || s.includes("express"))
    return "Backend Developer";
  if (s.includes("testing") || s.includes("selenium"))
    return "Software Tester";
  if (s.includes("sql") && s.includes("excel"))
    return "Data Analyst";

  return "Software Developer";
};

module.exports = {
  analyzeSkillsAI,
  calculateATS,
  predictRole,
  enforceImplicitLogic
};