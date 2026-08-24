import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

function Chat() {
  const [resumes, setResumes] = useState([])
  const [jobs, setJobs] = useState([])

  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your AI Career & Resume Advisor. Select your target resume and job description above, then ask me anything about your skill match, interview prep, or resume improvements!',
    },
  ])
  const [inputQuestion, setInputQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchResumesAndJobs()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const fetchResumesAndJobs = async () => {
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/jobs'),
      ])
      setResumes(resumesRes.data)
      setJobs(jobsRes.data)
      if (resumesRes.data.length > 0) setSelectedResumeId(resumesRes.data[0]._id)
      if (jobsRes.data.length > 0) setSelectedJobId(jobsRes.data[0]._id)
    } catch (err) {
      console.error('Error fetching chat context lists:', err)
    }
  }

  const handleSendMessage = async (textToSend) => {
    const questionText = textToSend || inputQuestion
    if (!questionText.trim()) return

    const userMessage = { sender: 'user', text: questionText }
    setMessages((prev) => [...prev, userMessage])
    setInputQuestion('')
    setLoading(true)

    try {
      const res = await api.post('/chat', {
        resumeId: selectedResumeId,
        jobId: selectedJobId,
        question: questionText,
        history: messages,
      })

      const botMessage = { sender: 'bot', text: res.data.answer }
      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      const errorMessage = {
        sender: 'bot',
        text: 'Sorry, I ran into an issue retrieving an answer. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const starterPrompts = [
    'What key technical skills am I missing for this role?',
    'How should I highlight my achievements in an interview?',
    'Give me 3 specific bullet points to add to my resume.',
    'Summarize my fit for this position in 2 sentences.',
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4 flex flex-col h-[calc(100vh-140px)]">
        {/* Header & Selectors */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">RAG Chat with Your Resume & Job Description</h1>
          <p className="text-xs text-gray-500 mb-3">Answers are grounded in vector embeddings of your target resume & job requirement context.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Target Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none bg-white"
              >
                {resumes.length === 0 && <option value="">No resumes uploaded</option>}
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.fileName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Target Job Description</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none bg-white"
              >
                {jobs.length === 0 && <option value="">No jobs added</option>}
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} {j.company ? `(${j.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto space-y-4 shadow-inner">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-2 border border-gray-200">
                <div className="animate-bounce font-bold">.</div>
                <div className="animate-bounce font-bold delay-100">.</div>
                <div className="animate-bounce font-bold delay-200">.</div>
                <span className="text-xs ml-1">Analyzing RAG chunks & generating answer...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Starter Prompts */}
        <div className="my-3 flex flex-wrap gap-1.5">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full font-medium transition-colors"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about your resume, skills, or job fit..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </Layout>
  )
}

export default Chat
