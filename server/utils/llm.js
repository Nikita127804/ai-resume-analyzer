const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY || '');

async function extractSkills(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `Extract a list of technical skills, tools, frameworks, programming languages, and technologies mentioned in the text below.
Return ONLY a valid JSON array of strings, with no markdown formatting, no code block formatting (do not wrap in \`\`\`json), no preamble, and no explanation.
Example output: ["React", "Node.js", "MongoDB", "Python", "Docker"]

Text:
${text}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    console.log('RAW GEMINI RESPONSE:', responseText);

    const cleaned = responseText.replace(/```json|```/g, '').trim();
    const skills = JSON.parse(cleaned);
    console.log('PARSED SKILLS:', skills);
    return Array.isArray(skills) ? skills : [];
  } catch (err) {
    console.error('Failed to extract skills with Gemini:', err.message);
    return [];
  }
}

module.exports = { extractSkills };
