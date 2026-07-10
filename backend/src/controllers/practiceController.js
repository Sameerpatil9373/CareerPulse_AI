const { generateWithAI } = require('../services/aiService');
const crypto = require('crypto'); // Built-in Node module for unique IDs

exports.generatePracticeQuestions = async (req, res) => {
  try {
    // Extract parameters sent from the frontend
    const { topics = ["Aptitude"], difficulty = "Medium", count = 5 } = req.body;

    const prompt = `
      You are an expert Senior Technical Interviewer.
      Generate exactly ${count} multiple-choice interview questions covering the following topics: ${topics.join(", ")}.
      The difficulty level must be strictly: ${difficulty}.
      Include a mix of Conceptual, Code Output, and Scenario-based questions if applicable to the topic.

      You must return a raw JSON array of objects. 
      Each object must have this exact structure:
      [
        {
          "id": "generate a unique short alphanumeric string",
          "type": "Conceptual", 
          "topic": "The specific topic this question relates to (e.g., React)",
          "question": "The detailed interview question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "The exact string of the correct option",
          "explanation": "A clear, concise explanation of why the answer is correct",
          "interviewTip": "A short, practical pro-tip to mention during an actual interview"
        }
      ]
    `;

    // 1. Call the AI Service
    const aiResponse = await generateWithAI(prompt);
    
    // 2. Parse the strict JSON response
    const questions = JSON.parse(aiResponse);
    
    // 3. (Optional but good practice) Ensure unique IDs just in case the AI hallucinates duplicates
    const safeQuestions = questions.map(q => ({
      ...q,
      id: q.id || crypto.randomBytes(4).toString('hex')
    }));

    // 4. Send back to the frontend
    return res.status(200).json({ 
      success: true, 
      data: safeQuestions 
    });

  } catch (error) {
    console.error("Failed to generate practice questions:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to generate AI questions. Please try again." 
    });
  }
};