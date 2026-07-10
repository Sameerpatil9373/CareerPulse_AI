const express = require('express');
const router = express.Router();
const { generatePracticeQuestions } = require('../controllers/practiceController');

// Matches the exact endpoint we defined in the frontend: POST /api/practice/generate
router.post('/generate', generatePracticeQuestions);

module.exports = router;