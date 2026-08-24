const { GoogleGenerativeAI } = require('@google/generative-ai');
const { cosineSimilarity } = require('./similarity');

const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY || '');

function chunkText(text, maxWords = 200, overlapWords = 40) {
  if (!text || typeof text !== 'string') return [];
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return [];

  const chunks = [];
  let index = 0;

  while (index < words.length) {
    const chunkWords = words.slice(index, index + maxWords);
    chunks.push(chunkWords.join(' '));
    index += (maxWords - overlapWords);
    if (index >= words.length - overlapWords && index < words.length) {
      break;
    }
  }

  return chunks;
}

async function answerQuestionWithRAG(question, resumeText = '', jobText = '', chatHistory = []) {
  try {
    const resumeChunks = chunkText(resumeText, 200, 40).map(c => `[Resume Context]: ${c}`);
    const jobChunks = chunkText(jobText, 200, 40).map(c => `[Job Description Context]: ${c}`);
    const allChunks = [...resumeChunks, ...jobChunks];

    if (allChunks.length === 0) {
      return "No resume or job description content was found to answer your question.";
    }

    const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

    // Embed question and all chunks in parallel for maximum performance
    const [questionRes, ...chunkResList] = await Promise.all([
      embeddingModel.embedContent(question),
      ...allChunks.map(c => embeddingModel.embedContent(c).catch(() => ({ embedding: { values: [] } })))
    ]);

    const questionVector = questionRes.embedding.values || [];

    const scoredChunks = allChunks.map((chunk, idx) => {
      const chunkVector = chunkResList[idx]?.embedding?.values || [];
      const sim = cosineSimilarity(questionVector, chunkVector);
      return { chunk, sim };
    });

    scoredChunks.sort((a, b) => b.sim - a.sim);
    const topChunks = scoredChunks.slice(0, 4).map(sc => sc.chunk).join('\n\n');

    const recentHistory = chatHistory.slice(-4).map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

    const llmModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `You are an AI Career Advisor & Technical Recruiter assistant helping a job applicant.
Answer the user's question accurately and helpfully, strictly using the relevant context retrieved from their resume and job description.

Retrieved Context:
${topChunks}

${recentHistory ? `Recent Conversation History:\n${recentHistory}\n` : ''}
User Question: ${question}

Instructions:
- Provide a clear, professional, direct answer.
- Reference specific details from the context where relevant.
- Keep the tone encouraging and constructive.`;

    const result = await llmModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('RAG Error:', err.message);
    return `I encountered an issue processing your request: ${err.message}`;
  }
}

module.exports = {
  chunkText,
  answerQuestionWithRAG,
};
