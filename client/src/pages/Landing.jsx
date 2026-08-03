import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Know exactly how well your resume fits the job
      </h1>
      <p className="text-gray-600 text-lg mb-8 max-w-xl">
        Upload your resume and a job description — get an instant match score,
        missing skills, and AI-powered suggestions to improve your chances.
      </p>
      <div className="flex gap-4">
        <Link
          to="/signup"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100"
        >
          Log In
        </Link>
      </div>
    </div>
  )
}

export default Landing