const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const { extractSkills, generateEmbedding } = require('../utils/llm');

exports.uploadResume = async (req, res) => {
  try {
    console.log('Upload request received');
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Starting PDF parse...');
    const pdfData = await pdfParse(req.file.buffer);
    console.log('PDF parse complete');
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from this PDF. It may be a scanned image.' });
    }

    console.log('Extracting skills & generating embedding using Gemini...');
    const extractedSkills = await extractSkills(rawText.trim());
    const embedding = await generateEmbedding(rawText.trim());

    const resume = await Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      rawText: rawText.trim(),
      extractedSkills,
      embedding,
    });

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        extractedSkills: resume.extractedSkills,
        uploadedAt: resume.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId })
      .select('-rawText -embedding')
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
