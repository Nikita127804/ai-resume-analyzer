const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: '',
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

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
