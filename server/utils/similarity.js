function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function calculateSkillMatch(resumeSkills = [], jobSkills = []) {
  if (!jobSkills || jobSkills.length === 0) {
    return { matchingSkills: resumeSkills, missingSkills: [], skillMatchScore: 100 };
  }

  const normalizedResumeSkills = resumeSkills.map(s => s.trim().toLowerCase());
  
  const matchingSkills = [];
  const missingSkills = [];

  jobSkills.forEach(jobSkill => {
    const cleanJobSkill = jobSkill.trim();
    const lowerJobSkill = cleanJobSkill.toLowerCase();

    // Check exact or partial inclusion match
    const found = normalizedResumeSkills.some(resSkill => 
      resSkill === lowerJobSkill || 
      resSkill.includes(lowerJobSkill) || 
      lowerJobSkill.includes(resSkill)
    );

    if (found) {
      matchingSkills.push(cleanJobSkill);
    } else {
      missingSkills.push(cleanJobSkill);
    }
  });

  const skillMatchScore = Math.round((matchingSkills.length / jobSkills.length) * 100);

  return {
    matchingSkills,
    missingSkills,
    skillMatchScore,
  };
}

module.exports = {
  cosineSimilarity,
  calculateSkillMatch,
};
