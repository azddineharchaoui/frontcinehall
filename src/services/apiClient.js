import axios from 'axios'

// Create Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Adaptez cette URL à votre environnement
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add interceptor for authentication
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { status } = error.response || {}
    
    if (status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/connexion'
    }
    
    return Promise.reject(error)
  }
)

export default apiClient