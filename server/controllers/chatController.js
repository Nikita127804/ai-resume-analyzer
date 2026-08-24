const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const { answerQuestionWithRAG } = require('../utils/rag');

exports.chatWithResume = async (req, res) => {
  try {
    const { resumeId, jobId, question, history } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    let resumeText = '';
    let jobText = '';

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
      if (resume) resumeText = resume.rawText;
    }

    if (jobId) {
      const job = await JobDescription.findOne({ _id: jobId, userId: req.userId });
      if (job) jobText = job.rawText;
    }

    console.log(`Processing RAG question for user ${req.userId}: "${question.slice(0, 50)}..."`);
    const answer = await answerQuestionWithRAG(question, resumeText, jobText, history || []);

    res.json({ answer });
  } catch (err) {
    console.error('Error in chat controller:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
