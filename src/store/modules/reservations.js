import api from '../../services/api';

export default {
  namespaced: true,
  
  state: {
    userReservations: [],
    currentReservation: null,
    sessionReservations: {},
    reservationTickets: {},
    reservationPayment: {}
  },
  
  getters: {
    getUserReservations: state => state.userReservations,
    getCurrentReservation: state => state.currentReservation,
    getSessionReservations: state => sessionId => state.sessionReservations[sessionId] || [],
    getReservationTickets: state => reservationId => state.reservationTickets[reservationId] || [],
    getReservationPayment: state => reservationId => state.reservationPayment[reservationId] || null
  },
  
  mutations: {
    SET_USER_RESERVATIONS(state, reservations) {
      state.userReservations = reservations;
    },
    SET_CURRENT_RESERVATION(state, reservation) {
      state.currentReservation = reservation;
    },
    SET_SESSION_RESERVATIONS(state, { sessionId, reservations }) {
      state.sessionReservations = {
        ...state.sessionReservations,
        [sessionId]: reservations
      };
    },
    SET_RESERVATION_TICKETS(state, { reservationId, tickets }) {
      state.reservationTickets = {
        ...state.reservationTickets,
        [reservationId]: tickets
      };
    },
    SET_RESERVATION_PAYMENT(state, { reservationId, payment }) {
      state.reservationPayment = {
        ...state.reservationPayment,
        [reservationId]: payment
      };
    },
    ADD_RESERVATION(state, reservation) {
      state.userReservations.push(reservation);
      
      // Add to session reservations if needed
      if (reservation.session_id && state.sessionReservations[reservation.session_id]) {
        state.sessionReservations[reservation.session_id].push(reservation);
      }
    },
    UPDATE_RESERVATION(state, updatedReservation) {
      // Update in user reservations array
      const index = state.userReservations.findIndex(r => r.id === updatedReservation.id);
      if (index !== -1) {
        state.userReservations.splice(index, 1, updatedReservation);
      }
      
      // Update current reservation if needed
      if (state.currentReservation && state.currentReservation.id === updatedReservation.id) {
        state.currentReservation = updatedReservation;
      }
      
      // Update in session reservations if needed
      if (updatedReservation.session_id && state.sessionReservations[updatedReservation.session_id]) {
        const sessionIndex = state.sessionReservations[updatedReservation.session_id].findIndex(
          r => r.id === updatedReservation.id
        );
        if (sessionIndex !== -1) {
          state.sessionReservations[updatedReservation.session_id].splice(sessionIndex, 1, updatedReservation);
        }
      }
    },
    REMOVE_RESERVATION(state, reservationId) {
      // Remove from user reservations
      state.userReservations = state.userReservations.filter(r => r.id !== reservationId);
      
      // Reset current reservation if needed
      if (state.currentReservation && state.currentReservation.id === reservationId) {
        state.currentReservation = null;
      }
      
      // Remove from session reservations
      Object.keys(state.sessionReservations).forEach(sessionId => {
        state.sessionReservations[sessionId] = state.sessionReservations[sessionId].filter(
          r => r.id !== reservationId
        );
      });
      
      // Remove tickets for this reservation
      if (state.reservationTickets[reservationId]) {
        const { [reservationId]: _, ...ticketsRest } = state.reservationTickets;
        state.reservationTickets = ticketsRest;
      }
      
      // Remove payment for this reservation
      if (state.reservationPayment[reservationId]) {
        const { [reservationId]: __, ...paymentRest } = state.reservationPayment;
        state.reservationPayment = paymentRest;
      }
    }
  },
  
  actions: {
    async fetchUserReservations({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getReservations();
        commit('SET_USER_RESERVATIONS', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load reservations', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchReservation({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getReservation(id);
        commit('SET_CURRENT_RESERVATION', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load reservation details', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchSessionReservations({ commit, dispatch }, sessionId) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getReservationsBySession(sessionId);
        commit('SET_SESSION_RESERVATIONS', { sessionId, reservations: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load session reservations', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchReservationTickets({ commit, dispatch }, reservationId) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getReservationTickets(reservationId);
        commit('SET_RESERVATION_TICKETS', { reservationId, tickets: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load reservation tickets', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchReservationPayment({ commit, dispatch }, reservationId) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getReservationPayment(reservationId);
        commit('SET_RESERVATION_PAYMENT', { reservationId, payment: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load reservation payment', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async createReservation({ commit, dispatch }, reservationData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.createReservation(reservationData);
        commit('ADD_RESERVATION', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to create reservation', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async updateReservation({ commit, dispatch }, { id, reservationData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.updateReservation(id, reservationData);
        commit('UPDATE_RESERVATION', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update reservation', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async cancelReservation({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        await api.cancelReservation(id);
        commit('REMOVE_RESERVATION', id);
      } catch (error) {
        dispatch('setError', error.message || 'Failed to cancel reservation', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async processPayment({ commit, dispatch }, paymentData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.processPayment(paymentData);
        
        // Update reservation payment if the response includes reservation id
        if (response.data && response.data.reservation_id) {
          commit('SET_RESERVATION_PAYMENT', { 
            reservationId: response.data.reservation_id, 
            payment: response.data 
          });
        }
        
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Payment processing failed', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async downloadTicket({ dispatch }, ticketId) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.downloadTicket(ticketId);
        
        // Create a URL for the blob and open it in a new tab
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ticket-${ticketId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to download ticket', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    }
  }
};