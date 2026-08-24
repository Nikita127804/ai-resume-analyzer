import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: Send OTP, 2: Verify OTP & Reset
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [receivedOtp, setReceivedOtp] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  // STEP 1: SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const res = await api.post('/auth/send-otp', { email: email.trim() })
      if (res.data.otp) {
        setReceivedOtp(res.data.otp)
      }
      setSuccessMsg(res.data.message || 'OTP generated successfully!')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // STEP 2: VERIFY OTP AND RESET PASSWORD
  const handleVerifyAndReset = async (e) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      })
      setSuccessMsg(res.data.message || 'Password reset successfully!')
      setStep(3) // Success step
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
            {step === 3 ? '🎉' : '🔐'}
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Enter OTP Code'}
            {step === 3 && 'Password Reset Complete'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {step === 1 && 'Enter your email address to receive a 6-digit One-Time Password (OTP).'}
            {step === 2 && `Enter the 6-digit OTP code sent to ${email}`}
            {step === 3 && 'Your account password has been updated successfully.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: SEND OTP FORM */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Generating 6-Digit OTP...' : 'Send OTP Code'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-semibold text-gray-600 hover:text-blue-600">
                ← Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP AND RESET PASSWORD FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            {/* Live OTP Notification Card */}
            {receivedOtp && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3.5 rounded-xl text-center shadow-inner">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">Your 6-Digit OTP Code:</p>
                <p className="text-2xl font-black text-blue-900 tracking-widest bg-white py-1 px-4 rounded-lg inline-block shadow-sm border border-blue-100">
                  {receivedOtp}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Copy or enter this OTP in the field below.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Enter 6-Digit OTP *</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-center text-lg font-black tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otp.trim() || !newPassword || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Verifying OTP & Resetting Password...' : 'Verify OTP & Reset Password'}
            </button>

            <div className="flex justify-between items-center text-xs pt-2">
              <button
                type="button"
                onClick={handleSendOtp}
                className="font-semibold text-blue-600 hover:underline"
              >
                🔄 Resend OTP Code
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-semibold text-gray-500 hover:text-gray-700"
              >
                ← Change Email
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS STEP */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs text-center space-y-1">
              <p className="font-bold text-sm">✅ Password Changed Successfully!</p>
              <p>{successMsg}</p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition-colors text-sm"
            >
              Go to Login Page →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
