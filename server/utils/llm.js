const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY || '');

const COMMON_TECH_SKILLS = [
  'React', 'React.js', 'Node.js', 'Express.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript',
  'Python', 'C++', 'Java', 'SQL', 'PostgreSQL', 'MySQL', 'HTML5', 'HTML', 'CSS3', 'CSS',
  'Tailwind CSS', 'Tailwind', 'Git', 'GitHub', 'Docker', 'Linux', 'REST APIs', 'REST API',
  'AWS', 'OCI', 'Google Cloud', 'Firebase', 'GraphQL', 'Redux', 'Next.js', 'Vue.js',
  'Angular', 'Django', 'Flask', 'Spring Boot', 'OpenAI', 'Gemini', 'Claude', 'Vector Embeddings',
  'RAG', 'Prompt Engineering', 'Data Structures', 'Algorithms', 'OOP', 'SDLC', 'JWT', 'OAuth',
  'Full-stack development', 'Applied AI', 'Large Language Models', 'Data engineering', 'Cloud infrastructure'
];

function fallbackExtractSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const found = new Set();

  COMMON_TECH_SKILLS.forEach(skill => {
    const lowerSkill = skill.toLowerCase();
    const escaped = lowerSkill.replace(/[-[\]{}()*+?.:\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'i');
    if (regex.test(text)) {
      found.add(skill);
    }
  });

  return Array.from(found);
}

async function extractSkills(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  let skills = [];
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `Extract a list of technical skills, tools, frameworks, programming languages, and technologies mentioned in the text below.
Return ONLY a valid JSON array of strings, with no markdown formatting, no code block formatting (do not wrap in \`\`\`json), no preamble, and no explanation.
Example output: ["React", "Node.js", "MongoDB", "Python", "Docker"]

Text:
${text}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      skills = parsed;
    }
  } catch (err) {
    console.error('Failed to extract skills with Gemini, using regex fallback:', err.message);
  }

  if (!skills || skills.length === 0) {
    skills = fallbackExtractSkills(text);
  }

  return skills;
}

async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(text.trim());
    return result.embedding.values || [];
  } catch (err) {
    console.error('Failed to generate embedding with Gemini:', err.message);
    return [];
  }
}

async function generateSuggestions(resumeText, jobText, missingSkills) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `You are an expert resume reviewer and career coach.
Analyze the candidate's resume against the job description.

Missing Skills identified: ${JSON.stringify(missingSkills)}

Resume Content:
${resumeText.slice(0, 3000)}

Job Description Content:
${jobText.slice(0, 3000)}

Provide 3 to 5 highly specific, actionable recommendations on how the candidate can improve their resume to better target this job role.
Return ONLY a valid JSON array of strings (bullet points). No markdown formatting, no code fences, no preamble.
Example format: ["Highlight your experience with Docker in the Projects section", "Quantify your achievements in React frontend development with metrics"]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleaned = responseText.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(cleaned);
    return Array.isArray(suggestions) ? suggestions : [
      'Tailor your summary to mention key skills required in the job description.',
      'Quantify your project achievements using metrics (e.g., improved performance by 30%).',
      'Incorporate missing technical skills into relevant project descriptions.'
    ];
  } catch (err) {
    console.error('Failed to generate suggestions with Gemini:', err.message);
    return [
      'Tailor your summary to mention key skills required in the job description.',
      'Quantify your project achievements using metrics (e.g., improved performance by 30%).',
      'Incorporate missing technical skills into relevant project descriptions.'
    ];
  }
}

async function rewriteBulletPoint(bulletPoint, jobContext) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `You are an expert ATS resume writer.
Rewrite the following resume bullet point to make it more impactful, metric-driven, and aligned with this job role.

Original Bullet Point:
"${bulletPoint}"

Job Context / Requirements:
"${jobContext ? jobContext.slice(0, 1000) : 'Full stack software engineering position'}"

Return ONLY the rewritten single bullet point string. Do not add quotes, introductory text, or markdown code blocks.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Failed to rewrite bullet point with Gemini:', err.message);
    return bulletPoint;
  }
}

module.exports = {
  extractSkills,
  generateEmbedding,
  generateSuggestions,
  rewriteBulletPoint,
};
