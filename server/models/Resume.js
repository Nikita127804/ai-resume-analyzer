const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  rawText: {
    type: String,
    required: true,
  },
  extractedSkills: {
    type: [String],
    default: [],
  },
  embedding: {
    type: [Number],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
