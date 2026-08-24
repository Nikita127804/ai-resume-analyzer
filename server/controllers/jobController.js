const JobDescription = require('../models/JobDescription');
const { extractSkills } = require('../utils/llm');

exports.createJob = async (req, res) => {
  try {
    const { title, company, rawText } = req.body;

    if (!title || !rawText) {
      return res.status(400).json({ message: 'Title and job description text are required' });
    }

    console.log('Extracting skills from job description text using Gemini...');
    const extractedSkills = await extractSkills(rawText.trim());

    const job = await JobDescription.create({
      userId: req.userId,
      title,
      company: company || '',
      rawText: rawText.trim(),
      extractedSkills,
    });

    res.status(201).json({
      message: 'Job description saved successfully',
      job,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await JobDescription.find({ userId: req.userId })
      .select('-rawText')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await JobDescription.findOne({ _id: req.params.id, userId: req.userId });

    if (!job) {
      return res.status(404).json({ message: 'Job description not found' });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
