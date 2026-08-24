import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [stats, setStats] = useState({ resumes: 0, jobs: 0, analyses: 0 })
  const [loadingStats, setLoadingStats] = useState(false)

  const dropdownRef = useRef(null)

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch quick stats when dropdown or modal opens
  const fetchUserStats = async () => {
    if (!user) return
    setLoadingStats(true)
    try {
      const [resumesRes, jobsRes, analysesRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/jobs'),
        api.get('/analyze'),
      ])
      setStats({
        resumes: resumesRes.data?.length || 0,
        jobs: jobsRes.data?.length || 0,
        analyses: analysesRes.data?.length || 0,
      })
    } catch (err) {
      console.error('Failed to fetch user stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  const toggleDropdown = () => {
    if (!dropdownOpen) fetchUserStats()
    setDropdownOpen((prev) => !prev)
  }

  const openProfileModal = () => {
    setDropdownOpen(false)
    fetchUserStats()
    setProfileModalOpen(true)
  }

  // Get user initials for avatar badge
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 text-xl font-black text-blue-600 tracking-tight">
            <span className="bg-blue-600 text-white rounded-lg px-2.5 py-0.5 text-base font-bold shadow-sm">AI</span>
            <span>Resume Analyzer</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/dashboard') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/upload"
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/upload') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Upload & Analyze
                </Link>

                <Link
                  to="/chat"
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/chat') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Chat (RAG)
                </Link>

                <div className="h-5 w-px bg-gray-200"></div>

                {/* Professional Clickable Profile Menu Button */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 p-1.5 pr-3 rounded-full transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    aria-label="User Profile Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {getInitials(user.name)}
                    </div>
                    <span className="text-xs font-bold text-gray-800 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu Popover */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow">
                            {getInitials(user.name)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{user.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          <span>CSE Project User • Active Session</span>
                        </div>
                      </div>

                      {/* Quick Stats Summary Bar */}
                      <div className="grid grid-cols-3 gap-1 px-3 py-2 border-b border-gray-100 text-center bg-gray-50/50">
                        <div>
                          <p className="text-[10px] text-gray-500 font-semibold uppercase">Resumes</p>
                          <p className="text-xs font-extrabold text-blue-600">{loadingStats ? '...' : stats.resumes}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-semibold uppercase">Jobs</p>
                          <p className="text-xs font-extrabold text-indigo-600">{loadingStats ? '...' : stats.jobs}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-semibold uppercase">Analyses</p>
                          <p className="text-xs font-extrabold text-green-600">{loadingStats ? '...' : stats.analyses}</p>
                        </div>
                      </div>

                      {/* Navigation Items */}
                      <div className="py-1">
                        <button
                          onClick={openProfileModal}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                        >
                          👤 <span>View Profile & Account Details</span>
                        </button>

                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                        >
                          📊 <span>My Dashboard & Reports</span>
                        </Link>

                        <Link
                          to="/upload"
                          onClick={() => setDropdownOpen(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                        >
                          ⚡ <span>New Resume & JD Match</span>
                        </Link>

                        <Link
                          to="/chat"
                          onClick={() => setDropdownOpen(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                        >
                          💬 <span>RAG Career Assistant</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 my-1"></div>

                      {/* Logout Button */}
                      <div className="px-2 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          🚪 <span>Sign Out of Account</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 text-sm font-semibold">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Account Profile Modal */}
      {profileModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header Cover */}
            <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 relative flex justify-between items-start">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                User Profile & Account
              </span>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Profile Avatar Overlay */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="-mt-12 mb-4 flex justify-between items-end">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-white text-white font-black text-2xl flex items-center justify-center shadow-lg">
                  {getInitials(user.name)}
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-extrabold px-3 py-1 rounded-full border border-green-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Authenticated
                </span>
              </div>

              {/* User Details */}
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900">{user.name}</h3>
                <p className="text-sm font-medium text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">User ID: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{user.id || 'N/A'}</span></p>
              </div>

              {/* User Activity Dashboard Metrics */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Platform Usage</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xl font-black text-blue-600">{stats.resumes}</p>
                    <p className="text-[10px] font-bold text-gray-500">Resumes</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xl font-black text-indigo-600">{stats.jobs}</p>
                    <p className="text-[10px] font-bold text-gray-500">Target Jobs</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xl font-black text-green-600">{stats.analyses}</p>
                    <p className="text-[10px] font-bold text-gray-500">Analyses</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setProfileModalOpen(false)
                    navigate('/dashboard')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow transition-colors text-center"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
