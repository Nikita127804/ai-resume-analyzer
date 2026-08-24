import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

function AnalysisDetail() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Bullet rewriter state
  const [inputBullet, setInputBullet] = useState('')
  const [rewrittenBullet, setRewrittenBullet] = useState('')
  const [rewriting, setRewriting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchAnalysis()
  }, [id])

  const fetchAnalysis = async () => {
    try {
      const res = await api.get(`/analyze/${id}`)
      setAnalysis(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleRewrite = async (e) => {
    e.preventDefault()
    if (!inputBullet.trim()) return
    setRewriting(true)
    setRewrittenBullet('')
    setCopied(false)

    try {
      const res = await api.post('/analyze/rewrite', {
        bulletPoint: inputBullet,
        jobId: analysis?.jobId?._id,
      })
      setRewrittenBullet(res.data.rewritten)
    } catch (err) {
      alert('Failed to rewrite bullet point')
    } finally {
      setRewriting(false)
    }
  }

  const handleCopy = () => {
    if (rewrittenBullet) {
      navigator.clipboard.writeText(rewrittenBullet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto py-16 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis detail...</p>
        </div>
      </Layout>
    )
  }

  if (error || !analysis) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto py-16 text-center">
          <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 inline-block mb-4">
            {error || 'Analysis report not found.'}
          </div>
          <br />
          <Link to="/upload" className="text-blue-600 font-semibold hover:underline">
            ← Back to Upload & Analysis Hub
          </Link>
        </div>
      </Layout>
    )
  }

  const matchColor =
    analysis.matchScore >= 80
      ? 'text-green-600 border-green-500 bg-green-50'
      : analysis.matchScore >= 60
      ? 'text-amber-600 border-amber-500 bg-amber-50'
      : 'text-red-600 border-red-500 bg-red-50'

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-4 space-y-8 print:p-0">
        {/* Top Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <Link to="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline mb-1 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Resume Analysis Report</h1>
            <p className="text-sm text-gray-600">
              Target Role: <span className="font-semibold text-gray-800">{analysis.jobId?.title}</span> {analysis.jobId?.company ? `at ${analysis.jobId.company}` : ''} | Resume: <span className="font-semibold text-gray-800">{analysis.resumeId?.fileName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm flex items-center gap-2"
            >
              🖨️ Export PDF Report
            </button>

            <Link
              to="/chat"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow flex items-center gap-2"
            >
              💬 Chat with Resume RAG
            </Link>
          </div>
        </div>

        {/* Printable Header (Visible only when printing) */}
        <div className="hidden print:block mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">Resume AI Analysis Report</h1>
          <p className="text-sm text-gray-600">Target Role: {analysis.jobId?.title} | Resume: {analysis.resumeId?.fileName}</p>
          <p className="text-xs text-gray-400">Generated on {new Date(analysis.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Overall Match Score */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Overall Match Score</h3>
            <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-inner ${matchColor}`}>
              <span className="text-3xl font-extrabold">{analysis.matchScore}%</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Match</span>
            </div>
            <div className="mt-4 flex justify-between w-full text-xs text-gray-600 border-t border-gray-100 pt-3">
              <span>Vector Similarity: <b>{Math.round((analysis.vectorSimilarity || 0) * 100)}%</b></span>
              <span>Skill Match: <b>{analysis.skillMatchScore}%</b></span>
            </div>
          </div>

          {/* Card 2: ATS Friendliness Score */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">ATS Friendliness</h3>
            <div className="w-28 h-28 rounded-full border-4 border-indigo-500 bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center shadow-inner">
              <span className="text-3xl font-extrabold">{analysis.atsScore}%</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">ATS Score</span>
            </div>
            <p className="text-xs text-gray-500 mt-4 border-t border-gray-100 pt-3 w-full">
              {analysis.atsScore >= 80 ? 'Highly compatible with ATS screeners' : 'Moderate compatibility - see checklist below'}
            </p>
          </div>

          {/* Card 3: Skills Summary Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Skills Comparison</h3>
            <div className="space-y-3 my-auto">
              <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                <span className="text-xs font-bold text-green-800">Matching Skills</span>
                <span className="text-lg font-extrabold text-green-700">{analysis.matchingSkills?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg border border-amber-100">
                <span className="text-xs font-bold text-amber-800">Missing Skills</span>
                <span className="text-lg font-extrabold text-amber-700">{analysis.missingSkills?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Skills Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Technical Skills Matrix</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div>
              <h3 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-1.5">
                <span>✓ Matching Skills Found ({analysis.matchingSkills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.matchingSkills?.length > 0 ? (
                  analysis.matchingSkills.map((skill, i) => (
                    <span key={i} className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-md font-semibold border border-green-200">
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">No matching skills detected.</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h3 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-1.5">
                <span>⚠️ Missing Skills to Target ({analysis.missingSkills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills?.length > 0 ? (
                  analysis.missingSkills.map((skill, i) => (
                    <span key={i} className="bg-amber-100 text-amber-900 text-xs px-3 py-1.5 rounded-md font-semibold border border-amber-200">
                      + {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">No missing skills! Resume covers all job skills.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestions Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <span>💡 Gemini AI Actionable Recommendations</span>
          </h2>
          <ul className="space-y-3">
            {analysis.suggestions?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-blue-50/50 p-3.5 rounded-lg border border-blue-100 text-sm text-gray-800">
                <span className="bg-blue-600 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ATS Detailed Breakdown Checklist */}
        {analysis.atsBreakdown?.checks && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              ATS Compatibility Audit ({analysis.atsScore}/100)
            </h2>
            <div className="space-y-3">
              {analysis.atsBreakdown.checks.map((c, idx) => (
                <div key={idx} className="p-3.5 border border-gray-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-start gap-3">
                    <span className={`text-base font-bold mt-0.5 ${c.passed ? 'text-green-600' : 'text-red-500'}`}>
                      {c.passed ? '✓' : '✗'}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{c.name}</h4>
                      <p className="text-xs text-gray-600">{c.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-700">
                    {c.score} / {c.maxScore} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Bullet Point Auto-Rewriter Tool */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl print:hidden">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span>✨ AI Bullet Point Rewriter</span>
          </h2>
          <p className="text-sm text-blue-200 mb-6">Paste any experience bullet point from your resume to enhance it with action verbs and align with this role.</p>

          <form onSubmit={handleRewrite} className="space-y-4">
            <textarea
              rows={3}
              required
              placeholder="e.g. Responsible for developing React components and testing code..."
              value={inputBullet}
              onChange={(e) => setInputBullet(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <button
              type="submit"
              disabled={rewriting || !inputBullet.trim()}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2.5 rounded-lg text-sm shadow transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {rewriting ? 'Rewriting with Gemini...' : 'Magic AI Rewrite ✨'}
            </button>
          </form>

          {rewrittenBullet && (
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">AI Rewritten Outcome:</p>
              <p className="text-sm text-white font-medium italic">"{rewrittenBullet}"</p>
              <button
                onClick={handleCopy}
                className="bg-white text-blue-900 font-bold px-3.5 py-1.5 rounded-lg text-xs hover:bg-blue-50 shadow transition-colors"
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Rewritten Bullet'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default AnalysisDetail
