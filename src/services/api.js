import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for CSRF token and session cookies
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { status } = error.response || {};
    
    if (status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    if (status === 403) {
      // Handle forbidden access
      console.error('Access forbidden');
    }
    
    if (status === 422) {
      // Handle validation errors
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  register: (userData) => apiClient.post('/register', userData),
  login: (credentials) => apiClient.post('/login', credentials),
  logout: () => apiClient.post('/logout'),
  refreshToken: () => apiClient.post('/refresh'),
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (userData) => apiClient.put('/profile', userData),
  deleteAccount: () => apiClient.delete('/profile'),
  
  // Movies
  getMovies: () => apiClient.get('/movies'),
  getPopularMovies: () => apiClient.get('/movies/popular'),
  getMovie: (id) => apiClient.get(`/movies/${id}`),
  getMoviesByGenre: (genre) => apiClient.get(`/movies/genre/${genre}`),
  createMovie: (movieData) => apiClient.post('/movies', movieData),
  updateMovie: (id, movieData) => apiClient.put(`/movies/${id}`, movieData),
  deleteMovie: (id) => apiClient.delete(`/movies/${id}`),
  
  // Sessions
  getSessions: () => apiClient.get('/sessions'),
  getSession: (id) => apiClient.get(`/sessions/${id}`),
  getSessionsByMovie: (movieId) => apiClient.get(`/sessions/movie/${movieId}`),
  getSessionsByTheater: (theaterId) => apiClient.get(`/sessions/theater/${theaterId}`),
  getAvailableSeats: (sessionId) => apiClient.get(`/sessions/${sessionId}/available-seats`),
  createSession: (sessionData) => apiClient.post('/sessions', sessionData),
  updateSession: (id, sessionData) => apiClient.put(`/sessions/${id}`, sessionData),
  deleteSession: (id) => apiClient.delete(`/sessions/${id}`),
  
  // Reservations
  getReservations: () => apiClient.get('/reservations'),
  getReservation: (id) => apiClient.get(`/reservations/${id}`),
  createReservation: (reservationData) => apiClient.post('/reservations', reservationData),
  updateReservation: (id, reservationData) => apiClient.put(`/reservations/${id}`, reservationData),
  cancelReservation: (id) => apiClient.delete(`/reservations/${id}`),
  getReservationsBySession: (sessionId) => apiClient.get(`/reservations/session/${sessionId}`),
  
  // Payments
  processPayment: (paymentData) => apiClient.post('/payments', paymentData),
  getUserPayments: () => apiClient.get('/payments'),
  getReservationPayment: (reservationId) => apiClient.get(`/reservations/${reservationId}/payment`),
  
  // Tickets
  getTickets: () => apiClient.get('/tickets'),
  getTicket: (id) => apiClient.get(`/tickets/${id}`),
  getReservationTickets: (reservationId) => apiClient.get(`/reservations/${reservationId}/tickets`),
  downloadTicket: (id) => apiClient.get(`/tickets/${id}/download`, { responseType: 'blob' }),
  
  // Theaters
  getTheaters: () => apiClient.get('/theaters'),
  getTheater: (id) => apiClient.get(`/theaters/${id}`),
  getTheatersByType: (type) => apiClient.get(`/theaters/type/${type}`),
  getTheaterSeats: (id) => apiClient.get(`/theaters/${id}/seats`),
  createTheater: (theaterData) => apiClient.post('/theaters', theaterData),
  updateTheater: (id, theaterData) => apiClient.put(`/theaters/${id}`, theaterData),
  deleteTheater: (id) => apiClient.delete(`/theaters/${id}`),
  
  // Admin
  getDashboardData: () => apiClient.get('/admin/dashboard'),
  getSessionOccupancy: () => apiClient.get('/admin/sessions/occupancy'),
  getMovieRevenue: () => apiClient.get('/admin/movies/revenue'),
  getUsers: () => apiClient.get('/admin/users'),
  updateUserRole: (id, roleData) => apiClient.put(`/admin/users/${id}/role`, roleData),
};

export default api;