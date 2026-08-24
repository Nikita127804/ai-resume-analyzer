import axios from 'axios'

let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
apiBase = apiBase.trim().replace(/\/+$/, '')
if (!apiBase.endsWith('/api')) {
  apiBase = `${apiBase}/api`
}
if (!apiBase.endsWith('/')) {
  apiBase = `${apiBase}/`
}

const api = axios.create({
  baseURL: apiBase,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Ensure config.url doesn't strip the /api subpath from baseURL
  if (config.url) {
    let cleanUrl = config.url.startsWith('/') ? config.url.substring(1) : config.url
    if (cleanUrl.startsWith('api/')) {
      cleanUrl = cleanUrl.substring(4)
    }
    config.url = cleanUrl
  }

  return config
})

export default api
