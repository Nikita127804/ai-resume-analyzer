const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  rankJobs,
  rewriteBullet,
} = require('../controllers/analysisController');

router.post('/', authMiddleware, createAnalysis);
router.get('/', authMiddleware, getAnalyses);
router.get('/:id', authMiddleware, getAnalysisById);
router.delete('/:id', authMiddleware, deleteAnalysis);
router.post('/rank', authMiddleware, rankJobs);
router.post('/rewrite', authMiddleware, rewriteBullet);

module.exports = router;
