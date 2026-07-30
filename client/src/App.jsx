import { useEffect, useState } from 'react'
import api from './api/axios'

function App() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.message))
      .catch(() => setStatus('backend not reachable'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">{status}</h1>
    </div>
  )
}

export default App