import apiClient from './apiClient'

export const movieService = {
  // Films
  getAllMovies(params = {}) {
    return apiClient.get('/movies', { params })
  },
  
  getPopularMovies() {
    return apiClient.get('/movies/popular')
  },
  
  getMovie(id) {
    return apiClient.get(`/movies/${id}`)
  },
  
  getMoviesByGenre(genre) {
    return apiClient.get(`/movies/genre/${genre}`)
  },
  
  // Séances
  getAllSessions(params = {}) {
    return apiClient.get('/sessions', { params })
  },
  
  getSession(id) {
    return apiClient.get(`/sessions/${id}`)
  },
  
  getSessionsByMovie(movieId) {
    return apiClient.get(`/sessions/movie/${movieId}`)
  },
  
  getSessionsByTheater(theaterId) {
    return apiClient.get(`/sessions/theater/${theaterId}`)
  },
  
  getAvailableSeats(sessionId) {
    return apiClient.get(`/sessions/${sessionId}/available-seats`)
  }
}