require('dotenv').config();
const { extractSkills } = require('./utils/llm');

async function test() {
  console.log('Testing Gemini Skill Extraction...');
  console.log('LLM_API_KEY set:', process.env.LLM_API_KEY ? 'Yes (length ' + process.env.LLM_API_KEY.length + ')' : 'No');
  
  const sampleText = `
    Jane Doe - Full Stack Developer
    Experienced in building web applications using React, Node.js, Express, MongoDB, and Tailwind CSS.
    Proficient with JavaScript, TypeScript, Python, REST APIs, Git, Docker, and AWS.
  `;

  console.log('Input sample text:', sampleText.trim());
  const skills = await extractSkills(sampleText);
  console.log('Extracted Skills Output:', skills);
}

test();
