const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with your API key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Base AI Generation Function using Gemini 2.5 Flash
 */
const generateWithAI = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // Forces strict JSON output
      }
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generates the full Resume Analysis report
 */
const generateFullAnalysis = async (extractedText, predictedRole, detectedSkills) => {
  try {
    console.log("🚀 Calling Cloud AI (Gemini 2.5 Flash)");

    const trimmedResume = extractedText ? extractedText.substring(0, 1500) : "";
    const safeSkills = detectedSkills && detectedSkills.length > 0 ? detectedSkills : ["Software Development"];
    const safeRole = predictedRole || "Software Engineer";

    const prompt = `
You are a Senior Technical Recruiter at a top-tier tech company (e.g., Google, Microsoft).
Evaluate this candidate's resume for the role of ${safeRole}.
Provide a premium, objective hiring report. Use direct, concise hiring language. Do not use generic AI filler, educational tone, or exaggerations.

STRICT CONSTRAINTS:
1. "summary": 60-80 words MAXIMUM (3-5 short sentences). Highly concise executive briefing. Do not list tech stacks repeatedly.
2. "strengths": Exactly 3-5 concise bullet points highlighting core competencies.
3. "improvements": Exactly 3-5 actionable, technical gaps (e.g., "Demonstrate Docker usage", "Include CI/CD pipeline metrics").
4. "questions": EXACTLY 8 technical interview questions based strictly on their resume. Format as an array of objects with question, expected answer, and interviewer explanation.
5. "explanation": 40 words MAXIMUM explaining precisely why the resume achieved this ATS score.

OUTPUT FORMAT (Return STRICTLY valid JSON, no markdown formatting, no code blocks):
{
  "summary": "...",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "questions": [
    {
      "question": "...",
      "answer": "...",
      "explanation": "..."
    }
  ],
  "explanation": "..."
}

RESUME DATA:
${trimmedResume}
`;

    let raw = await generateWithAI(prompt);
    console.log("🧠 AI Response Received");

    // Robust JSON extraction
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      console.log("❌ No JSON structure found");
      return getFallbackAnalysis(safeSkills);
    }

    let jsonText = raw.substring(firstBrace, lastBrace + 1);

    // Aggressive cleanup for JSON parsing
    jsonText = jsonText
      .replace(/\\"/g, '"')      
      .replace(/\\n/g, " ")      
      .replace(/\n/g, " ")       
      .replace(/\r/g, "")        
      .replace(/\t/g, " ")       
      .replace(/,\s*]/g, "]")    
      .replace(/,\s*\}/g, "}");  

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.log("❌ JSON.parse failed. Retrying with aggressive quote fix...");
      try {
        const fixedJson = jsonText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        parsed = JSON.parse(fixedJson);
      } catch (e) {
        return getFallbackAnalysis(safeSkills);
      }
    }

    // Validate core structure
    if (!parsed.summary || !parsed.questions || !parsed.explanation) {
      return getFallbackAnalysis(safeSkills);
    }

    // Force Array Limits & Fallbacks
    parsed.strengths = Array.isArray(parsed.strengths) && parsed.strengths.length > 0 
      ? parsed.strengths.slice(0, 5) 
      : ["Solid technical foundation.", "Adaptable to modern frameworks.", "Demonstrates problem-solving capability."];
      
    parsed.improvements = Array.isArray(parsed.improvements) && parsed.improvements.length > 0 
      ? parsed.improvements.slice(0, 5) 
      : ["Quantify project impacts with measurable data.", "Expand on testing methodologies used.", "Include details on CI/CD pipelines."];

    // Ensure exactly 8 questions with correct schema
    let validQuestions = Array.isArray(parsed.questions) ? parsed.questions.filter(q => q.question && q.answer && q.explanation) : [];
    
    while (validQuestions.length < 8) {
      const fallbackSkill = safeSkills[validQuestions.length % safeSkills.length] || "your core tech stack";
      validQuestions.push({
        question: `Can you walk me through a complex problem you solved using ${fallbackSkill}?`,
        answer: "Candidate should explain the context, action, and measurable result (STAR method).",
        explanation: "Assesses practical problem-solving and deep understanding of the tool."
      });
    }

    return {
      summary: parsed.summary,
      strengths: parsed.strengths,
      improvements: parsed.improvements,
      questions: validQuestions.slice(0, 8),
      explanation: parsed.explanation
    };
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    return getFallbackAnalysis(detectedSkills);
  }
};

/**
 * Fallback Analysis Safety Net
 */
const getFallbackAnalysis = (skills = []) => {
  return {
    summary: "The candidate demonstrates a solid foundation in software development with a focus on modern web technologies. Their technical journey highlights a progression from core fundamentals to complex framework implementations. They appear well-equipped to handle both individual tasks and collaborative team environments.",
    strengths: [
      "Demonstrates solid understanding of core development fundamentals.",
      "Shows ability to bridge technical gaps across full-stack requirements.",
      "Practical experience with project lifecycles and deployment."
    ],
    improvements: [
      "Add specific quantitative metrics to project outcomes.",
      "Include more context on agile methodologies.",
      "Expand on cloud infrastructure experience."
    ],
    questions: [
      {
        question: "What is the difference between SQL and NoSQL databases?",
        answer: "SQL is relational with a fixed schema; NoSQL is non-relational with dynamic schemas.",
        explanation: "Tests fundamental database architecture knowledge."
      },
      {
        question: "How do you approach state management in large-scale applications?",
        answer: "By using tools like Redux or Context API, keeping state localized where possible.",
        explanation: "Evaluates architectural planning capabilities."
      },
      {
        question: "What is the role of middleware in a backend application?",
        answer: "Functions that have access to the request and response objects to execute code, modify requests, or end cycles.",
        explanation: "Checks understanding of request lifecycle."
      },
      {
        question: "How do you ensure your RESTful APIs are secure?",
        answer: "Implementing JWT, rate limiting, HTTPS, and input validation.",
        explanation: "Assesses security best practices."
      },
      {
        question: "What was the biggest technical hurdle in your recent project and how did you overcome it?",
        answer: "Candidate should use the STAR method to describe a specific challenge.",
        explanation: "Tests practical debugging and resilience."
      },
      {
        question: "Can you walk me through the architecture of a complex feature you've built?",
        answer: "Candidate should clearly map out frontend, backend, and database interactions.",
        explanation: "Evaluates system design communication."
      },
      {
        question: "How would you optimize a database query slowing down a production environment?",
        answer: "Use indexing, analyze query execution plans, or implement caching strategies.",
        explanation: "Tests advanced performance optimization."
      },
      {
        question: "How would you design a scalable microservices architecture for real-time data?",
        answer: "Utilize message brokers like Kafka/RabbitMQ and ensure stateless services.",
        explanation: "Assesses senior-level system design knowledge."
      }
    ],
    explanation: "Candidate shows strong alignment with modern development roles, bridging technical gaps effectively."
  };
};

module.exports = { 
  generateWithAI, 
  generateFullAnalysis, 
  getFallbackAnalysis 
};