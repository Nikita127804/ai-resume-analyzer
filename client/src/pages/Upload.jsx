import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

function Upload() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'job' | 'analyze' | 'rank'

  // Data lists
  const [resumes, setResumes] = useState([])
  const [jobs, setJobs] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  // Upload Resume state
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(null)
  const [uploadError, setUploadError] = useState('')

  // Add Job Description state
  const [jobTitle, setJobTitle] = useState('')
  const [jobCompany, setJobCompany] = useState('')
  const [jobText, setJobText] = useState('')
  const [savingJob, setSavingJob] = useState(false)
  const [jobSuccess, setJobSuccess] = useState(null)
  const [jobError, setJobError] = useState('')

  // Single Analyze state
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  // Multi-JD Rank state
  const [rankResumeId, setRankResumeId] = useState('')
  const [ranking, setRanking] = useState(false)
  const [rankResults, setRankResults] = useState(null)
  const [rankError, setRankError] = useState('')

  useEffect(() => {
    fetchResumesAndJobs()
  }, [])

  const fetchResumesAndJobs = async () => {
    setLoadingData(true)
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        api.get('/api/resumes'),
        api.get('/api/jobs'),
      ])
      setResumes(resumesRes.data)
      setJobs(jobsRes.data)
      if (resumesRes.data.length > 0) {
        setSelectedResumeId(resumesRes.data[0]._id)
        setRankResumeId(resumesRes.data[0]._id)
      }
      if (jobsRes.data.length > 0) {
        setSelectedJobId(jobsRes.data[0]._id)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleResumeUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setUploadError('')
    setUploadSuccess(null)

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const res = await api.post('/api/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadSuccess(res.data)
      setFile(null)
      await fetchResumesAndJobs()
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    if (!jobTitle || !jobText) return
    setSavingJob(true)
    setJobError('')
    setJobSuccess(null)

    try {
      const res = await api.post('/api/jobs', {
        title: jobTitle,
        company: jobCompany,
        rawText: jobText,
      })
      setJobSuccess(res.data)
      setJobTitle('')
      setJobCompany('')
      setJobText('')
      await fetchResumesAndJobs()
    } catch (err) {
      setJobError(err.response?.data?.message || 'Failed to save job description')
    } finally {
      setSavingJob(false)
    }
  }

  const handleStartAnalysis = async (e) => {
    e.preventDefault()
    if (!selectedResumeId || !selectedJobId) {
      setAnalyzeError('Please select both a resume and a job description')
      return
    }
    setAnalyzing(true)
    setAnalyzeError('')

    try {
      const res = await api.post('/api/analyze', {
        resumeId: selectedResumeId,
        jobId: selectedJobId,
      })
      navigate(`/analysis/${res.data.analysis._id}`)
    } catch (err) {
      setAnalyzeError(err.response?.data?.message || 'Failed to generate analysis')
      setAnalyzing(false)
    }
  }

  const handleRunRanking = async (e) => {
    e.preventDefault()
    if (!rankResumeId) return
    setRanking(true)
    setRankError('')
    setRankResults(null)

    try {
      const res = await api.post('/api/analyze/rank', {
        resumeId: rankResumeId,
      })
      setRankResults(res.data)
    } catch (err) {
      setRankError(err.response?.data?.message || 'Failed to rank job descriptions')
    } finally {
      setRanking(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Resume & Job Analysis Hub</h1>
          <p className="text-gray-600 mt-1">Upload resumes, create target job descriptions, run AI skill matching, and rank roles.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 1. Upload Resume
          </button>

          <button
            onClick={() => setActiveTab('job')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'job'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            💼 2. Add Job Description
          </button>

          <button
            onClick={() => setActiveTab('analyze')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'analyze'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚡ 3. Run AI Match Analysis
          </button>

          <button
            onClick={() => setActiveTab('rank')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'rank'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 4. Multi-JD Vector Ranking
          </button>
        </div>

        {/* TAB 1: UPLOAD RESUME */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Resume PDF</h2>
            <p className="text-sm text-gray-600 mb-6">Select a PDF resume file. Text and technical skills will be automatically extracted using Gemini AI.</p>

            <form onSubmit={handleResumeUpload} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept=".pdf"
                  id="resume-upload"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="resume-upload" className="cursor-pointer block">
                  <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-3">
                    📁
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {file ? file.name : 'Click to select or drag PDF file here'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF files up to 5MB</p>
                </label>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                  <p className="font-bold">✅ Resume uploaded & parsed successfully!</p>
                  <p className="text-xs mt-1">File: {uploadSuccess.resume.fileName}</p>
                  {uploadSuccess.resume.extractedSkills?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">Extracted Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {uploadSuccess.resume.extractedSkills.map((skill, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Parsing Resume & Extracting Skills...</span>
                  </>
                ) : (
                  'Upload & Extract Skills'
                )}
              </button>
            </form>

            {/* List of Existing Resumes */}
            <div className="mt-10 border-t border-gray-100 pt-6">
              <h3 className="text-md font-bold text-gray-900 mb-3">Your Uploaded Resumes ({resumes.length})</h3>
              {resumes.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No resumes uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resumes.map((r) => (
                    <div key={r._id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.fileName}</p>
                        <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                        {r.extractedSkills?.length || 0} skills
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD JOB DESCRIPTION */}
        {activeTab === 'job' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Add Target Job Description</h2>
            <p className="text-sm text-gray-600 mb-6">Enter job title, company name, and full job description text.</p>

            <form onSubmit={handleCreateJob} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Google / Microsoft"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description Text *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste the full job requirements, responsibilities, and skill specs here..."
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              {jobError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {jobError}
                </div>
              )}

              {jobSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                  <p className="font-bold">✅ Job Description saved & skill vector generated!</p>
                  <p className="text-xs mt-1">Title: {jobSuccess.job.title} {jobSuccess.job.company ? `(${jobSuccess.job.company})` : ''}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={savingJob || !jobTitle || !jobText}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingJob ? 'Saving Job & Extracting Skills...' : 'Save Job Description'}
              </button>
            </form>

            {/* List of Existing Jobs */}
            <div className="mt-10 border-t border-gray-100 pt-6">
              <h3 className="text-md font-bold text-gray-900 mb-3">Saved Target Jobs ({jobs.length})</h3>
              {jobs.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No job descriptions added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jobs.map((j) => (
                    <div key={j._id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{j.title}</p>
                        <p className="text-xs text-gray-500">{j.company || 'Company N/A'}</p>
                      </div>
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                        {j.extractedSkills?.length || 0} skills
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RUN AI MATCH ANALYSIS */}
        {activeTab === 'analyze' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Run AI Match Analysis</h2>
            <p className="text-sm text-gray-600 mb-6">Select one resume and one job description to perform deep semantic similarity matching, ATS score breakdown, and Gemini suggestions.</p>

            <form onSubmit={handleStartAnalysis} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Resume *</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  {resumes.length === 0 && <option value="">No resumes available (Upload one first)</option>}
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName} ({r.extractedSkills?.length || 0} skills)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Target Job Description *</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  {jobs.length === 0 && <option value="">No jobs available (Add one first)</option>}
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} {j.company ? `- ${j.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {analyzeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {analyzeError}
                </div>
              )}

              <button
                type="submit"
                disabled={analyzing || !selectedResumeId || !selectedJobId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Generating Vector Match & ATS Analysis...</span>
                  </>
                ) : (
                  '🚀 Analyze Match Score & Generate Recommendations'
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: MULTI-JD VECTOR RANKING */}
        {activeTab === 'rank' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Multi-Job Description Vector Ranking</h2>
            <p className="text-sm text-gray-600 mb-6">Compare a single resume against all saved job descriptions to discover your best matching job role.</p>

            <form onSubmit={handleRunRanking} className="flex gap-4 mb-6">
              <select
                value={rankResumeId}
                onChange={(e) => setRankResumeId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.fileName}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={ranking || !rankResumeId}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition-colors disabled:opacity-50"
              >
                {ranking ? 'Ranking Jobs...' : 'Rank All Roles'}
              </button>
            </form>

            {rankError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-6">
                {rankError}
              </div>
            )}

            {rankResults && (
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-900">
                  Ranking Results for <span className="text-blue-600">{rankResults.resume.fileName}</span>
                </h3>

                {rankResults.rankedJobs.length === 0 ? (
                  <p className="text-sm text-gray-500">No jobs to rank.</p>
                ) : (
                  <div className="space-y-3">
                    {rankResults.rankedJobs.map((item, idx) => (
                      <div
                        key={item.jobId}
                        className={`p-4 rounded-xl border transition-all ${
                          idx === 0
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              idx === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              #{idx + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                              <p className="text-xs text-gray-600">{item.company || 'Company N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xl font-extrabold text-blue-600">{item.overallMatchScore}%</span>
                              <p className="text-xs text-gray-500">Overall Match</p>
                            </div>

                            <button
                              onClick={async () => {
                                try {
                                  const res = await api.post('/api/analyze', {
                                    resumeId: rankResumeId,
                                    jobId: item.jobId,
                                  })
                                  navigate(`/analysis/${res.data.analysis._id}`)
                                } catch (err) {
                                  alert(err.response?.data?.message || 'Error creating analysis')
                                }
                              }}
                              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm"
                            >
                              View Analysis →
                            </button>
                          </div>
                        </div>

                        {/* Matching / Missing Skill Pills */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="font-semibold text-gray-600">Matching ({item.matchingSkills.length}):</span>
                          {item.matchingSkills.slice(0, 5).map((s, i) => (
                            <span key={i} className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                              ✓ {s}
                            </span>
                          ))}
                          {item.missingSkills.length > 0 && (
                            <>
                              <span className="font-semibold text-gray-600 ml-2">Missing ({item.missingSkills.length}):</span>
                              {item.missingSkills.slice(0, 4).map((s, i) => (
                                <span key={i} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                                  ! {s}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Upload
