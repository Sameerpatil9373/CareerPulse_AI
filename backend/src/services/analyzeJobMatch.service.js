const normalize = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

// Map common variants to one normalized token
const SKILL_ALIASES = new Map([
  ["node", "node.js"],
  ["nodejs", "node.js"],
  ["postgres", "postgresql"],
  ["postgre", "postgresql"],
  ["rest", "rest api"],
  ["restful", "rest api"],
  ["api", "rest api"],
  ["js", "javascript"],
  ["es6", "javascript"],
]);

const normalizeSkill = (skill) => {
  const s = normalize(skill);
  return SKILL_ALIASES.get(s) || s;
};

const uniq = (arr) => Array.from(new Set(arr));

const hasAny = (arr, items) => items.some((i) => arr.includes(i));
const hasAll = (arr, items) => items.every((i) => arr.includes(i));

// Keep role templates distinct so MERN != Full Stack
const ROLE_TEMPLATES = {
  "Full Stack Developer": {
    jobQuery: "full stack developer",
    skills: [
      "react",
      "javascript",
      "node.js",
      "express",
      "mongodb",
      "sql",
      "rest api",
      "postman",
      "responsive ui",
    ],
  },
  "MERN Stack Specialist": {
    jobQuery: "mern stack developer",
    skills: [
      "mongodb",
      "express",
      "react",
      "node.js",
      "mern stack",
      "redux",
      "tailwind",
      "jwt",
    ],
  },
  "Frontend Engineer": {
    jobQuery: "frontend engineer",
    skills: [
      "html",
      "css",
      "javascript",
      "react",
      "responsive ui",
      "bootstrap",
      "frontend",
    ],
  },
  "Backend Developer": {
    jobQuery: "backend developer",
    skills: ["node.js", "express", "mongodb", "sql", "rest api", "postman", "backend"],
  },
  "JavaScript Developer": {
    jobQuery: "javascript developer",
    skills: ["javascript", "react", "node.js", "git", "npm"],
  },
  "Software Engineer": {
    jobQuery: "software engineer",
    skills: ["dsa", "git", "oops", "problem solving"],
  },
  "Database Administrator": {
    jobQuery: "database administrator",
    skills: ["sql", "mysql", "mongodb", "postgresql", "database design", "database management"],
  },
  "Software Tester": {
    jobQuery: "software tester",
    skills: ["testing", "automation", "selenium", "postman", "test scripts"],
  },
  "Python Developer": {
    jobQuery: "python developer",
    skills: ["python", "django", "flask", "pandas", "numpy"],
  },
  "AI / ML Engineer": {
    jobQuery: "machine learning engineer",
    skills: ["python", "machine learning", "tensorflow", "pytorch", "data analysis"],
  },
};

const inferSkills = (resumeSkills = []) => {
  const skills = uniq(resumeSkills.map(normalizeSkill));

  // JS inference if React/Node/Express present
  if (hasAny(skills, ["react", "node.js", "express"]) && !skills.includes("javascript")) {
    skills.push("javascript");
  }

  // MERN indicator
  if (hasAll(skills, ["react", "node.js", "mongodb"]) && !skills.includes("mern stack")) {
    skills.push("mern stack");
  }

  // Frontend capability
  if (hasAny(skills, ["react", "javascript"]) && !skills.includes("frontend")) {
    skills.push("frontend");
  }

  // Backend capability
  if (hasAny(skills, ["node.js", "express", "python"]) && !skills.includes("backend")) {
    skills.push("backend");
  }

  // Database management
  if (
    hasAny(skills, ["sql", "mysql", "mongodb", "postgresql"]) &&
    !skills.includes("database management")
  ) {
    skills.push("database management");
  }

  return uniq(skills);
};

const roleFilterMatches = (roleName, userTargetRole) => {
  if (!userTargetRole || userTargetRole === "RECOMMEND_MULTIPLE_ROLES_BASED_ON_SKILLS") return true;

  const searchTarget = normalize(userTargetRole);
  const role = normalize(roleName);

  // direct contains either direction
  if (role.includes(searchTarget) || searchTarget.includes(role)) return true;

  // keyword match ignoring generic terms
  const genericWords = new Set([
    "software",
    "developer",
    "engineer",
    "specialist",
    "analyst",
    "administrator",
    "stack",
    "role",
    "jobs",
  ]);

  const words = searchTarget
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !genericWords.has(w));

  return words.length > 0 && words.some((w) => role.includes(w));
};

const computeMatch = (resumeSkills, templateSkills) => {
  const resume = new Set(resumeSkills.map(normalizeSkill));

  const normalizedTemplate = templateSkills.map(normalizeSkill);
  const matchingSkills = normalizedTemplate.filter((t) => resume.has(t));
  const missingSkills = normalizedTemplate.filter((t) => !resume.has(t));

  const matchScore = Math.round((matchingSkills.length / normalizedTemplate.length) * 100);

  return { matchScore, matchingSkills, missingSkills };
};

const explanationForScore = (matchScore) => {
  if (matchScore >= 80) return "Strong alignment with your current stack.";
  if (matchScore >= 50) return "Good fit. Focus on identified skill gaps to qualify.";
  return "Foundation present. Consider learning the missing technologies for this path.";
};

/**
 * Analyze job-role matches from detected resume skills.
 * - Returns top 5 roles sorted by matchScore
 * - Adds `jobQuery` for clean “Explore jobs” search
 */
const analyzeJobMatch = async (resumeText, skills = [], userTargetRole = "") => {
  const resumeSkills = inferSkills(skills);

  const results = [];

  for (const [role, meta] of Object.entries(ROLE_TEMPLATES)) {
    if (!roleFilterMatches(role, userTargetRole)) continue;

    const { matchScore, matchingSkills, missingSkills } = computeMatch(resumeSkills, meta.skills);

    // If user searched for a role, show it even if low; otherwise require minimum signal
    const shouldInclude = Boolean(userTargetRole) || matchScore >= 25;
    if (!shouldInclude) continue;

    results.push({
      role,
      jobQuery: meta.jobQuery, // frontend should use this for “Explore jobs”
      matchScore,
      matchingSkills,
      missingSkills,
      explanation: explanationForScore(matchScore),
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
};

module.exports = { analyzeJobMatch };
