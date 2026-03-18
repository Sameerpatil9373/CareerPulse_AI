const axios = require("axios");

const generateFullAnalysis = async (resumeText, role, skills) => {
  try {
    console.log("🚀 Calling Ollama AI (gemma3:1b)");

    const trimmedResume = resumeText.substring(0, 1500);

    const prompt = `
Generate a hiring report for this ${role} resume in JSON format.
Skills: ${skills.join(", ")}

FORMAT:
{
 "summary": "9-10 lines detailed technical journey.",
 "questions": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"],
 "explanation": "3-4 lines market suitability."
}

Rules for Questions (Must be exactly 8):
1. Questions 1-4: Short technical questions (1 sentence each).
2. Questions 5-6: Questions specifically about a project mentioned in the resume.
3. Questions 7-8: Advanced technical questions (exactly 2 lines each).

General Rules:
- summary: EXACTLY 9-10 lines.
- explanation: EXACTLY 3-4 lines.
- Return ONLY the JSON object. No other text.

Resume:
${trimmedResume}
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "gemma3:1b",
        prompt,
        stream: false,
        options: {
          temperature: 0.1, 
          num_predict: 1200, // Increased slightly for longer questions
          num_ctx: 2048 
        }
      }
    );

    let raw = response.data.response;
    console.log("🧠 Ollama Response Received");

    // Robust JSON extraction
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      console.log("❌ No JSON structure found");
      return getFallbackAnalysis(skills);
    }

    let jsonText = raw.substring(firstBrace, lastBrace + 1);

    // Aggressive cleanup for JSON parsing
    jsonText = jsonText
      .replace(/\\"/g, '"')      // Fix escaped quotes
      .replace(/\\n/g, " ")      // Fix escaped newlines
      .replace(/\n/g, " ")       // Fix literal newlines
      .replace(/\r/g, "")        // Fix carriage returns
      .replace(/\t/g, " ")       // Fix tabs
      .replace(/,\s*]/g, "]")    // Fix trailing commas in arrays
      .replace(/,\s*\}/g, "}");  // Fix trailing commas in objects

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.log("❌ JSON.parse failed. Retrying with aggressive quote fix...");
      try {
        // Try to fix unquoted or single quoted keys if AI messed up
        const fixedJson = jsonText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        parsed = JSON.parse(fixedJson);
      } catch (e) {
        return getFallbackAnalysis(skills);
      }
    }

    // Validate structure
    if (!parsed.summary || !parsed.questions || !parsed.explanation) {
      return getFallbackAnalysis(skills);
    }

    // Normalize Questions - Ensure exactly 8 with correct mix
    let questions = Array.isArray(parsed.questions) ? parsed.questions.filter(q => typeof q === 'string' && q.length > 5) : [];
    
    // Increased character limit for 2-line questions
    questions = questions.slice(0, 8).map(q => q.length > 200 ? q.substring(0, 197) + "..." : q);
    
    while (questions.length < 8) {
      const skill = skills[questions.length % skills.length] || "web development";
      questions.push(`Can you explain a technical challenge you faced while working with ${skill}?`);
    }

    return {
      summary: parsed.summary,
      questions: questions,
      explanation: parsed.explanation
    };
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    return getFallbackAnalysis(skills);
  }
};

/**
 * Fallback Analysis with 8 Mixed Questions
 */
const getFallbackAnalysis = (skills = []) => {
  return {
    summary: "The candidate demonstrates a solid foundation in software development with a focus on modern web technologies. Their technical journey highlights a progression from core fundamentals to complex framework implementations. Throughout their experience, they have consistently applied best practices to ensure code quality and scalability. The listed projects suggest a practical understanding of full-stack development lifecycles and user-centric design. Their proficiency in the current tech stack is complemented by a solid grasp of problem-solving. They appear well-equipped to handle both individual tasks and collaborative team environments. Overall, the candidate presents a strong professional profile with significant potential for high-impact contributions. Their strengths in technical architecture and implementation make them a valuable asset for any engineering team.",
    questions: [
      "What is the difference between SQL and NoSQL databases?",
      "How do you approach state management in large-scale applications?",
      "What is the role of middleware in an Express.js application?",
      "How do you ensure your RESTful APIs are secure and scalable?",
      "Regarding your portfolio project: What was the biggest technical hurdle you faced and how did you overcome it?",
      "Can you walk me through the architecture of the most complex feature you've built in a recent project?",
      "If you had to optimize a database query that is slowing down a production environment, what steps would you take to identify the bottleneck and improve performance?",
      "How would you design a scalable microservices architecture that handles real-time data synchronization across multiple services while maintaining data consistency?"
    ],
    explanation: "Candidate shows strong alignment with modern development roles. Their skill set covers both frontend and backend requirements effectively. They have demonstrated the ability to bridge technical gaps and deliver reliable solutions. Based on the resume, they are well-suited for mid-to-senior level engineering positions."
  };
};

module.exports = { generateFullAnalysis, getFallbackAnalysis };