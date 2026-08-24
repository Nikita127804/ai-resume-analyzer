import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3.5 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 text-xl font-black text-blue-600 tracking-tight">
          <span className="bg-blue-600 text-white rounded-lg px-2 py-0.5 text-base">AI</span>
          <span>Resume Analyzer</span>
        </Link>

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

              <div className="h-4 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3">
                <span className="text-gray-700 text-xs font-semibold bg-gray-100 px-2.5 py-1 rounded-full">
                  👤 {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Logout
                </button>
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
  )
}

export default Navbar
