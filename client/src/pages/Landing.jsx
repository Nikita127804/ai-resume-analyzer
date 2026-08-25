import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-600 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <span className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl px-3 py-1 text-lg font-bold shadow-lg shadow-blue-500/20">AI</span>
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">Resume Analyzer</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-4 py-2">
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5"
          >
            Get Started Free →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto w-full px-6 pt-12 pb-20 text-center relative z-10 flex-1 flex flex-col justify-center items-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-bold mb-8 backdrop-blur-md shadow-inner">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span>Powered by Google Gemini 3.6 Flash & MongoDB Vector Search</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6 max-w-4xl">
          Know Exactly How Well Your Resume Fits <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Any Target Job Spec
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
          Upload your resume PDF and target job description. Get high-dimensional 3072-vector match scores, 100-pt ATS audit, missing skills matrix, and interactive RAG Q&A.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-md">
          <Link
            to="/signup"
            className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold px-8 py-4 rounded-2xl text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-1 text-center"
          >
            Analyze Your Resume Free →
          </Link>
          <Link
            to="/login"
            className="flex-1 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold px-6 py-4 rounded-2xl text-base transition-all hover:border-slate-600 text-center"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Live Mockup Demo Card */}
        <div className="w-full max-w-4xl rounded-3xl p-1 bg-gradient-to-b from-slate-700/50 via-slate-800/30 to-slate-900/50 shadow-2xl shadow-blue-900/20 backdrop-blur-xl">
          <div className="bg-slate-950/90 rounded-[22px] p-6 text-left border border-slate-800/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                <span className="text-xs font-mono text-slate-500 ml-2">AI Resume Analyzer Dashboard</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                ● Live AI Analysis Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Vector Similarity Match</p>
                <p className="text-3xl font-black text-blue-400">84%</p>
                <p className="text-[10px] text-slate-500 mt-1">3072-dim Cosine Distance</p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">ATS Friendliness Audit</p>
                <p className="text-3xl font-black text-emerald-400">100/100</p>
                <p className="text-[10px] text-slate-500 mt-1">5-Point Structure Checked</p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Multi-JD Vector Rank</p>
                <p className="text-3xl font-black text-indigo-400">#1 Choice</p>
                <p className="text-[10px] text-slate-500 mt-1">Top Match Across 6 Roles</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto w-full px-6 pb-20 relative z-10">
        <h2 className="text-2xl font-bold text-slate-200 text-center mb-10">Core Engineering Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
              🎯
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Vector Embeddings</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Uses Gemini Embedding models to turn resumes & job specs into 3072-dimensional vectors for semantic context matching.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
              ✅
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Rule-Based ATS Auditor</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Deterministic 100-point structure checker testing contact details, section headers, bullet density, & PDF parsing sanity.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-4">
              💬
            </div>
            <h3 className="text-lg font-bold text-white mb-2">RAG Career Assistant</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Chunking & semantic vector retrieval grounding AI answers directly in your candidate experience & target job context.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 AI Resume Analyzer • Final Year CSE Project</p>
      </footer>
    </div>
  )
}

export default Landing
