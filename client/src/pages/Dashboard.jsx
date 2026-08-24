import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

function Dashboard() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [resumesCount, setResumesCount] = useState(0)
  const [jobsCount, setJobsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [analysesRes, resumesRes, jobsRes] = await Promise.all([
        api.get('/analyze'),
        api.get('/resumes'),
        api.get('/jobs'),
      ])
      setAnalyses(analysesRes.data)
      setResumesCount(resumesRes.data.length)
      setJobsCount(jobsRes.data.length)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnalysis = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this analysis report?')) return

    try {
      await api.delete(`/analyze/${id}`)
      setAnalyses((prev) => prev.filter((a) => a._id !== id))
    } catch (err) {
      alert('Failed to delete analysis record')
    }
  }

  const avgMatchScore =
    analyses.length > 0
      ? Math.round(analyses.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / analyses.length)
      : 0

  const filteredAnalyses = analyses.filter((a) => {
    const jobTitle = a.jobId?.title?.toLowerCase() || ''
    const jobCompany = a.jobId?.company?.toLowerCase() || ''
    const resumeName = a.resumeId?.fileName?.toLowerCase() || ''
    const q = searchQuery.toLowerCase()
    return jobTitle.includes(q) || jobCompany.includes(q) || resumeName.includes(q)
  })

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-4 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name || 'Developer'}!</h1>
            <p className="text-blue-100 text-sm mt-1">
              AI Resume Analyzer Dashboard • Track your target job fit and optimization reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:bg-blue-50 transition-colors"
            >
              + Upload & Analyze
            </Link>
            <Link
              to="/chat"
              className="bg-blue-500/30 backdrop-blur-md text-white font-bold border border-white/30 px-5 py-2.5 rounded-xl text-sm hover:bg-blue-500/40 transition-colors"
            >
              💬 Chat with Resume
            </Link>
          </div>
        </div>

        {/* Analytics Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded Resumes</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{resumesCount}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Job Descriptions</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{jobsCount}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed Analyses</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">{analyses.length}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Match Score</p>
            <p className="text-3xl font-extrabold text-green-600 mt-2">{avgMatchScore}%</p>
          </div>
        </div>

        {/* Past Analyses Table / List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Past Match Analyses</h2>
              <p className="text-xs text-gray-500">Review past job alignment scores and AI suggestions.</p>
            </div>

            <input
              type="text"
              placeholder="Search by job title, company, or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading your analysis records...</div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-600 font-semibold mb-2">No past analyses found.</p>
              <p className="text-xs text-gray-500 mb-4">Upload a resume and job description to get started.</p>
              <Link
                to="/upload"
                className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Run New Analysis
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-gray-50">
                    <th className="py-3 px-4">Target Job & Company</th>
                    <th className="py-3 px-4">Resume File</th>
                    <th className="py-3 px-4">Match Score</th>
                    <th className="py-3 px-4">ATS Score</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAnalyses.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{item.jobId?.title || 'Unknown Job'}</p>
                        <p className="text-xs text-gray-500">{item.jobId?.company || 'Company N/A'}</p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        {item.resumeId?.fileName || 'Resume file'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-xs inline-block ${
                            item.matchScore >= 80
                              ? 'bg-green-100 text-green-800'
                              : item.matchScore >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.matchScore}% Match
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold text-xs">
                          {item.atsScore}% ATS
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          to={`/analysis/${item._id}`}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-md text-xs transition-colors"
                        >
                          View Report →
                        </Link>
                        <button
                          onClick={(e) => handleDeleteAnalysis(item._id, e)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-2.5 py-1.5 rounded-md text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
