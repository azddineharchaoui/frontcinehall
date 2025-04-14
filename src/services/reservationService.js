import apiClient from './apiClient'

export const reservationService = {
  getUserReservations() {
    return apiClient.get('/reservations')
  },
  
  getReservation(id) {
    return apiClient.get(`/reservations/${id}`)
  },
  
  createReservation(reservationData) {
    return apiClient.post('/reservations', reservationData)
  },
  
  updateReservation(id, reservationData) {
    return apiClient.put(`/reservations/${id}`, reservationData)
  },
  
  cancelReservation(id) {
    return apiClient.delete(`/reservations/${id}`)
  },
  
  getReservationsBySession(sessionId) {
    return apiClient.get(`/reservations/session/${sessionId}`)
  },
  
  getReservationTickets(reservationId) {
    return apiClient.get(`/reservations/${reservationId}/tickets`)
  }
}