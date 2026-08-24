const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true,
  },
  matchScore: {
    type: Number,
    required: true,
  },
  vectorSimilarity: {
    type: Number,
    default: 0,
  },
  skillMatchScore: {
    type: Number,
    default: 0,
  },
  atsScore: {
    type: Number,
    default: 0,
  },
  matchingSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  suggestions: {
    type: [String],
    default: [],
  },
  atsBreakdown: {
    type: Object,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
