const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const { extractSkills, generateEmbedding, generateSuggestions, rewriteBulletPoint } = require('../utils/llm');
const { cosineSimilarity, calculateSkillMatch } = require('../utils/similarity');
const { checkAtsFriendliness } = require('../utils/atsChecker');

exports.createAnalysis = async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId || !jobId) {
      return res.status(400).json({ message: 'Both resumeId and jobId are required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const job = await JobDescription.findOne({ _id: jobId, userId: req.userId });
    if (!job) {
      return res.status(404).json({ message: 'Job description not found' });
    }

    // Auto-repair missing resume skills if empty
    if (!resume.extractedSkills || resume.extractedSkills.length === 0) {
      console.log('Extracting missing skills for resume...');
      resume.extractedSkills = await extractSkills(resume.rawText);
      await resume.save();
    }

    // Auto-repair missing job skills if empty
    if (!job.extractedSkills || job.extractedSkills.length === 0) {
      console.log('Extracting missing skills for job...');
      job.extractedSkills = await extractSkills(job.rawText);
      await job.save();
    }

    // Ensure embeddings exist
    let resumeEmbedding = resume.embedding;
    if (!resumeEmbedding || resumeEmbedding.length === 0) {
      console.log('Generating missing resume embedding...');
      resumeEmbedding = await generateEmbedding(resume.rawText);
      resume.embedding = resumeEmbedding;
      await resume.save();
    }

    let jobEmbedding = job.embedding;
    if (!jobEmbedding || jobEmbedding.length === 0) {
      console.log('Generating missing job embedding...');
      jobEmbedding = await generateEmbedding(job.rawText);
      job.embedding = jobEmbedding;
      await job.save();
    }

    // 1. Vector Cosine Similarity (0 to 1)
    const vecSimRaw = cosineSimilarity(resumeEmbedding, jobEmbedding);
    const vectorSimilarity = Math.max(0, Math.min(1, vecSimRaw));

    // 2. Skill Match
    const { matchingSkills, missingSkills, skillMatchScore } = calculateSkillMatch(
      resume.extractedSkills || [],
      job.extractedSkills || []
    );

    // 3. Combined Match Score (0 to 100)
    const semanticScore = Math.round(vectorSimilarity * 100);
    const matchScore = Math.min(100, Math.round((semanticScore * 0.5) + (skillMatchScore * 0.5)));

    // 4. ATS Check
    const atsResult = checkAtsFriendliness(resume.rawText, resume.fileName);

    // 5. LLM Suggestions
    console.log('Generating AI improvement suggestions...');
    const suggestions = await generateSuggestions(resume.rawText, job.rawText, missingSkills);

    // Save Analysis
    const analysis = await Analysis.create({
      userId: req.userId,
      resumeId: resume._id,
      jobId: job._id,
      matchScore,
      vectorSimilarity,
      skillMatchScore,
      atsScore: atsResult.totalScore,
      matchingSkills,
      missingSkills,
      suggestions,
      atsBreakdown: atsResult,
    });

    const populatedAnalysis = await Analysis.findById(analysis._id)
      .populate('resumeId', 'fileName')
      .populate('jobId', 'title company');

    res.status(201).json({
      message: 'Analysis completed successfully',
      analysis: populatedAnalysis,
    });
  } catch (err) {
    console.error('Error creating analysis:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.userId })
      .populate('resumeId', 'fileName')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });

    res.json(analyses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId })
      .populate('resumeId')
      .populate('jobId');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Auto-repair analysis if matching/missing skills were empty due to prior missing skill arrays
    let updated = false;
    if (analysis.resumeId && (!analysis.resumeId.extractedSkills || analysis.resumeId.extractedSkills.length === 0)) {
      analysis.resumeId.extractedSkills = await extractSkills(analysis.resumeId.rawText);
      await analysis.resumeId.save();
      updated = true;
    }

    if (analysis.jobId && (!analysis.jobId.extractedSkills || analysis.jobId.extractedSkills.length === 0)) {
      analysis.jobId.extractedSkills = await extractSkills(analysis.jobId.rawText);
      await analysis.jobId.save();
      updated = true;
    }

    if (updated || (!analysis.matchingSkills || analysis.matchingSkills.length === 0)) {
      const { matchingSkills, missingSkills, skillMatchScore } = calculateSkillMatch(
        analysis.resumeId?.extractedSkills || [],
        analysis.jobId?.extractedSkills || []
      );
      analysis.matchingSkills = matchingSkills;
      analysis.missingSkills = missingSkills;
      analysis.skillMatchScore = skillMatchScore;

      const semanticScore = Math.round((analysis.vectorSimilarity || 0) * 100);
      analysis.matchScore = Math.min(100, Math.round((semanticScore * 0.5) + (skillMatchScore * 0.5)));

      await analysis.save();
    }

    res.json(analysis);
  } catch (err) {
    console.error('Error fetching analysis details:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json({ message: 'Analysis deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.rankJobs = async (req, res) => {
  try {
    const { resumeId, jobIds } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: 'resumeId is required for ranking' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (!resume.extractedSkills || resume.extractedSkills.length === 0) {
      resume.extractedSkills = await extractSkills(resume.rawText);
      await resume.save();
    }

    let resumeEmbedding = resume.embedding;
    if (!resumeEmbedding || resumeEmbedding.length === 0) {
      resumeEmbedding = await generateEmbedding(resume.rawText);
      resume.embedding = resumeEmbedding;
      await resume.save();
    }

    let jobQuery = { userId: req.userId };
    if (Array.isArray(jobIds) && jobIds.length > 0) {
      jobQuery._id = { $in: jobIds };
    }

    const jobs = await JobDescription.find(jobQuery);

    if (jobs.length === 0) {
      return res.json({ resume, rankedJobs: [] });
    }

    const rankedJobs = [];

    for (const job of jobs) {
      if (!job.extractedSkills || job.extractedSkills.length === 0) {
        job.extractedSkills = await extractSkills(job.rawText);
        await job.save();
      }

      let jobEmbedding = job.embedding;
      if (!jobEmbedding || jobEmbedding.length === 0) {
        jobEmbedding = await generateEmbedding(job.rawText);
        job.embedding = jobEmbedding;
        await job.save();
      }

      const vecSim = cosineSimilarity(resumeEmbedding, jobEmbedding);
      const { matchingSkills, missingSkills, skillMatchScore } = calculateSkillMatch(
        resume.extractedSkills || [],
        job.extractedSkills || []
      );

      const semanticScore = Math.round(vecSim * 100);
      const overallMatchScore = Math.min(100, Math.round((semanticScore * 0.5) + (skillMatchScore * 0.5)));

      rankedJobs.push({
        jobId: job._id,
        title: job.title,
        company: job.company,
        overallMatchScore,
        semanticScore,
        skillMatchScore,
        matchingSkills,
        missingSkills,
      });
    }

    rankedJobs.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

    res.json({
      resume: {
        id: resume._id,
        fileName: resume.fileName,
      },
      rankedJobs,
    });
  } catch (err) {
    console.error('Error ranking jobs:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.rewriteBullet = async (req, res) => {
  try {
    const { bulletPoint, jobId } = req.body;

    if (!bulletPoint) {
      return res.status(400).json({ message: 'bulletPoint text is required' });
    }

    let jobContext = '';
    if (jobId) {
      const job = await JobDescription.findById(jobId);
      if (job) jobContext = job.rawText;
    }

    const rewritten = await rewriteBulletPoint(bulletPoint, jobContext);

    res.json({
      original: bulletPoint,
      rewritten,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
