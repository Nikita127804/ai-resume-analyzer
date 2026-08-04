const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');

exports.uploadResume = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('req.file:', req.file);
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Starting PDF parse...');
    // req.file.buffer contains the raw PDF data (since we used memoryStorage)
    const pdfData = await pdfParse(req.file.buffer);
    console.log('PDF parse complete');
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from this PDF. It may be a scanned image.' });
    }

    const resume = await Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      rawText: rawText.trim(),
    });

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        uploadedAt: resume.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all resumes for the logged-in user
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId })
      .select('-rawText') // don't send full text back in list view, keep it lightweight
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get one resume with full text (for detail views later)
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