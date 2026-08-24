function checkAtsFriendliness(resumeText, fileName = '') {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
    return {
      totalScore: 0,
      checks: [
        { name: 'Resume Content', category: 'General', passed: false, score: 0, maxScore: 100, detail: 'Resume text is empty or unreadable.' }
      ]
    };
  }

  const text = resumeText.trim();
  const lowerText = text.toLowerCase();
  const checks = [];
  let totalScore = 0;

  // 1. Standard Section Headers (Max 30 pts)
  const requiredHeaders = [
    { name: 'Experience / Work History', regex: /(experience|employment|work history|career)/i },
    { name: 'Education', regex: /(education|academic|qualification)/i },
    { name: 'Skills / Competencies', regex: /(skills|technical skills|technologies|competencies)/i },
    { name: 'Projects / Achievements', regex: /(projects|key projects|achievements)/i },
  ];

  let headerScore = 0;
  let headersPassed = 0;
  requiredHeaders.forEach(h => {
    if (h.regex.test(text)) {
      headersPassed++;
      headerScore += 7.5;
    }
  });

  headerScore = Math.round(headerScore);
  totalScore += headerScore;
  checks.push({
    name: 'Section Headings',
    category: 'Structure',
    passed: headersPassed >= 3,
    score: headerScore,
    maxScore: 30,
    detail: `Found ${headersPassed} out of 4 standard section headers (${requiredHeaders.map(h => h.name).join(', ')}).`
  });

  // 2. Contact Information Presence (Max 20 pts)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

  const hasEmail = emailRegex.test(text);
  const hasPhone = phoneRegex.test(text);

  let contactScore = 0;
  if (hasEmail) contactScore += 10;
  if (hasPhone) contactScore += 10;

  totalScore += contactScore;
  checks.push({
    name: 'Contact Information',
    category: 'Contact',
    passed: hasEmail && hasPhone,
    score: contactScore,
    maxScore: 20,
    detail: `Email: ${hasEmail ? 'Detected' : 'Missing'}, Phone Number: ${hasPhone ? 'Detected' : 'Missing'}.`
  });

  // 3. Word Count & Document Length (Max 20 pts)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  let lengthScore = 0;
  let lengthDetail = '';
  if (wordCount >= 300 && wordCount <= 1800) {
    lengthScore = 20;
    lengthDetail = `Optimal word count (${wordCount} words). Fits well within standard 1-2 page ATS guidelines.`;
  } else if (wordCount >= 200 && wordCount < 300) {
    lengthScore = 12;
    lengthDetail = `Slightly short (${wordCount} words). Consider expanding on project details and achievements.`;
  } else if (wordCount > 1800 && wordCount <= 3000) {
    lengthScore = 12;
    lengthDetail = `Slightly long (${wordCount} words). Consider condensing to focus on key relevant experience.`;
  } else {
    lengthScore = 5;
    lengthDetail = `Sub-optimal word count (${wordCount} words). Extremely short or long resumes struggle in ATS scoring.`;
  }

  totalScore += lengthScore;
  checks.push({
    name: 'Document Length & Word Count',
    category: 'Length',
    passed: lengthScore >= 12,
    score: lengthScore,
    maxScore: 20,
    detail: lengthDetail
  });

  // 4. Formatting & Bullet Point Structure (Max 15 pts)
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const bulletSymbolRegex = /^[\s\t]*[•\-*–—▪►]\s+/;
  const bulletCount = lines.filter(line => bulletSymbolRegex.test(line)).length;

  let formatScore = 0;
  let formatDetail = '';
  if (bulletCount >= 5) {
    formatScore = 15;
    formatDetail = `Strong use of bullet points (${bulletCount} bullet lines detected). ATS scanners parse bullet points easily.`;
  } else if (lines.length >= 10) {
    formatScore = 10;
    formatDetail = `Moderate formatting (${bulletCount} explicit bullet symbols). Consider using standard bullet points (•, -) for achievements.`;
  } else {
    formatScore = 5;
    formatDetail = `Wall of text detected with few bullet points. Bullet points improve scannability for both ATS and recruiters.`;
  }

  totalScore += formatScore;
  checks.push({
    name: 'Bullet Point Formatting',
    category: 'Formatting',
    passed: formatScore >= 10,
    score: formatScore,
    maxScore: 15,
    detail: formatDetail
  });

  // 5. Text Parsing & Clean Character Sanity (Max 15 pts)
  const nonAsciiRegex = /[^\x00-\x7F]/g;
  const nonAsciiMatches = text.match(nonAsciiRegex) || [];
  const nonAsciiRatio = nonAsciiMatches.length / text.length;

  let sanityScore = 15;
  let sanityDetail = 'Clean text extraction without garbled characters or font rendering corruption.';
  if (nonAsciiRatio > 0.08) {
    sanityScore = 5;
    sanityDetail = 'High concentration of special/non-standard characters detected. May indicate scanned PDF or weird font encoding.';
  } else if (nonAsciiRatio > 0.03) {
    sanityScore = 10;
    sanityDetail = 'Minor non-standard characters detected. Text is generally readable.';
  }

  totalScore += sanityScore;
  checks.push({
    name: 'Text Readability & Character Encoding',
    category: 'Readability',
    passed: sanityScore >= 10,
    score: sanityScore,
    maxScore: 15,
    detail: sanityDetail
  });

  return {
    totalScore: Math.min(100, Math.round(totalScore)),
    checks,
  };
}

module.exports = {
  checkAtsFriendliness,
};
