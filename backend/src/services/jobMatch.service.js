const analyzeJobMatch = async (resumeText, skills, userTargetRole = "") => {
  // Normalize resume skills to lowercase
  let resumeSkills = skills.map(s => s.toLowerCase());

  // Problem 3 Fix Safety Net: JS Inference
  if (resumeSkills.some(s => ["react", "node.js", "node", "express"].includes(s))) {
    if (!resumeSkills.includes("javascript")) resumeSkills.push("javascript");
  }

  // MERN Stack Indicator
  if (
    resumeSkills.includes("react") && 
    (resumeSkills.includes("node.js") || resumeSkills.includes("node")) &&
    resumeSkills.includes("mongodb")
  ) {
    if (!resumeSkills.includes("mern stack")) resumeSkills.push("mern stack");
  }

  // Frontend Capability
  if (resumeSkills.includes("react") || resumeSkills.includes("javascript")) {
    if (!resumeSkills.includes("frontend")) resumeSkills.push("frontend");
  }

  // Backend Capability
  if (
    resumeSkills.includes("node.js") || 
    resumeSkills.includes("express") || 
    resumeSkills.includes("python")
  ) {
    if (!resumeSkills.includes("backend")) resumeSkills.push("backend");
  }

  // Database Management
  if (resumeSkills.some(s => ["sql", "mysql", "mongodb", "postgres", "postgresql"].includes(s))) {
    if (!resumeSkills.includes("database management")) resumeSkills.push("database management");
  }

  // Responsive UI Indicator
  if (resumeSkills.some(s => ["react", "tailwind", "bootstrap", "css", "frontend"].includes(s))) {
    if (!resumeSkills.includes("responsive ui")) resumeSkills.push("responsive ui");
  }

  const roleTemplates = {
    "Full Stack Developer": [
      "react", "node.js", "express", "mongodb", "javascript", "rest api", "responsive ui", "html", "css"
    ],
    "Frontend Developer": [
      "react", "javascript", "html", "css", "tailwind css", "responsive ui", "typescript"
    ],
    "Backend Developer": [
      "node.js", "express", "mongodb", "sql", "rest api", "python", "docker"
    ],
    "Data Analyst": [
      "python", "sql", "excel", "tableau", "pandas", "data visualization"
    ],
    "Software Tester": [
      "selenium", "testing", "manual testing", "automation", "jest", "cypress", "qa", "quality assurance"
    ],
    "Database Administrator": [
      "sql", "mysql", "postgresql", "mongodb", "database design", "query optimization", "nosql", "backup", "recovery", "dba"
    ],
    "AI/ML Engineer": [
      "python", "pytorch", "tensorflow", "machine learning", "deep learning", "nlp", "computer vision", "scikit-learn", "data science"
    ],
    "DevOps Engineer": [
      "docker", "kubernetes", "jenkins", "aws", "azure", "linux", "ci/cd", "terraform", "ansible"
    ],
    "Cloud Architect": [
      "aws", "azure", "gcp", "cloud computing", "serverless", "iam", "s3", "ec2", "networking"
    ],
    "Cyber Security Analyst": [
      "network security", "penetration testing", "firewalls", "cryptography", "ethical hacking", "vulnerability assessment"
    ],
    "Mobile App Developer": [
      "react native", "flutter", "swift", "kotlin", "android studio", "ios development", "dart", "mobile ui"
    ],
    "Java Backend Developer": [
      "java", "spring boot", "hibernate", "maven", "microservices", "junit", "jpa"
    ]
  };

  const results = [];
  const isExplicitSearch = userTargetRole && userTargetRole !== "RECOMMEND_MULTIPLE_ROLES_BASED_ON_SKILLS";

  for (const role in roleTemplates) {
    let isSearchMatch = false;
    
    if (isExplicitSearch) {
      const searchTarget = userTargetRole.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
      const roleName = role.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
      
      // 1. Direct or partial match for the role name (normalized)
      if (roleName.includes(searchTarget) || searchTarget.includes(roleName)) {
        isSearchMatch = true;
      } else {
        // 2. Word-based matching (more fuzzy)
        // Keep acronyms like AI, ML, UI, UX (length 2)
        const genericWords = ["software", "developer", "engineer", "specialist", "analyst", "administrator", "database", "junior", "senior", "lead"];
        const searchWords = searchTarget.split(/\s+/).filter(w => w.length >= 2 && !genericWords.includes(w));
        const roleWords = roleName.split(/\s+/).filter(w => w.length >= 2 && !genericWords.includes(w));
        
        isSearchMatch = searchWords.length > 0 && searchWords.some(sWord => 
          roleWords.some(rWord => rWord.includes(sWord) || sWord.includes(rWord))
        );
      }
      
      if (!isSearchMatch) continue;
    }

    const roleSkills = roleTemplates[role];

    const matchingSkills = roleSkills.filter(skill =>
      resumeSkills.some(s => {
        if (skill === "java" && s === "javascript") return false;
        if (skill === "node" && s === "node.js") return true;
        return s === skill || s.includes(skill) || skill.includes(s);
      })
    );

    const missingSkills = roleSkills.filter(skill => !matchingSkills.includes(skill));
    const matchScore = Math.round((matchingSkills.length / roleSkills.length) * 100);

    // For recommendations, show roles with >= 30% match
    // For explicit searches, show even if 0% match
    if (isExplicitSearch || matchScore >= 30) {
      results.push({
        role,
        matchScore,
        matchingSkills,
        missingSkills,
        explanation:
          matchScore >= 80
            ? "Strong alignment with your current stack."
            : matchScore >= 50
            ? "Good fit. Focus on identified skill gaps to qualify."
            : matchScore >= 30
            ? "Foundation present. Consider learning the missing technologies for this path."
            : matchScore > 0
            ? "Partial skills detected. Here is your growth roadmap."
            : "No direct skill match found. Here is the roadmap to reach this role."
      });
    }
  }

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  // If explicit search and no results found yet (even 0% ones), try finding roles by skills
  if (isExplicitSearch && results.length === 0) {
    for (const role in roleTemplates) {
      const roleSkills = roleTemplates[role];
      const matchingSkills = roleSkills.filter(skill =>
        resumeSkills.some(s => s === skill || s.includes(skill) || skill.includes(s))
      );
      const matchScore = Math.round((matchingSkills.length / roleSkills.length) * 100);

      if (matchScore > 30) { // Only fallback if there's a decent skill match
        results.push({
          role,
          matchScore,
          matchingSkills,
          missingSkills: roleSkills.filter(s => !matchingSkills.includes(s)),
          explanation: `We couldn't find a direct match for your search, but your skills are a ${matchScore}% match for this related role.`
        });
      }
    }
  }

  // Sort again in case fallback results were added
  results.sort((a, b) => b.matchScore - a.matchScore);

  // If explicit search, return all matches (usually 1).
  if (isExplicitSearch) return results;

  // If recommendation mode, return top 5 roles that meet the 30% threshold.
  // If fewer than 5 meet the threshold, just return those.
  return results.slice(0, 5);
};

module.exports = { analyzeJobMatch };