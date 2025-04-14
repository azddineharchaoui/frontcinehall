import apiClient from './apiClient'

export const authService = {
  register(userData) {
    return apiClient.post('/register', userData)
  },
  
  login(credentials) {
    return apiClient.post('/login', credentials)
  },
  
  logout() {
    return apiClient.post('/logout').finally(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })
  },
  
  
  getProfile() {
    return apiClient.get('/profile')
  },
  
  updateProfile(profileData) {
    return apiClient.put('/profile', profileData)
  },
  
  deleteAccount() {
    return apiClient.delete('/profile')
  },
  
  saveToken(token) {
    localStorage.setItem('token', token)
  },
  
  saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user))
  },
  
  getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
  
  isLoggedIn() {
    return !!localStorage.getItem('token')
  }
}