import axios from 'axios'

let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
if (rawBaseURL.endsWith('/api')) {
  rawBaseURL = rawBaseURL.slice(0, -4)
}
if (rawBaseURL.endsWith('/')) {
  rawBaseURL = rawBaseURL.slice(0, -1)
}

const api = axios.create({
  baseURL: `${rawBaseURL}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
