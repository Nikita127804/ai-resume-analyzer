const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');


// Middleware — must come BEFORE routes
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-resume-analyzer-one-sage.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman/Thunder Client)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));


app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health-check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes — must come AFTER middleware
app.use('/api/auth', authRoutes);

app.use('/api/resumes', resumeRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  tls: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Error handler for multer errors (file too large, wrong type, etc.)
app.use((err, req, res, next) => {
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max size is 5MB.' });
  }
  next(err);
});
app.use('/api/jobs', jobRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});