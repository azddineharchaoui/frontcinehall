import api from '../../services/api';

export default {
  namespaced: true,
  
  state: {
    sessions: [],
    currentSession: null,
    movieSessions: {},
    theaterSessions: {},
    availableSeats: {}
  },
  
  getters: {
    getAllSessions: state => state.sessions,
    getCurrentSession: state => state.currentSession,
    getSessionsByMovie: state => movieId => state.movieSessions[movieId] || [],
    getSessionsByTheater: state => theaterId => state.theaterSessions[theaterId] || [],
    getAvailableSeats: state => sessionId => state.availableSeats[sessionId] || []
  },
  
  mutations: {
    SET_SESSIONS(state, sessions) {
      state.sessions = sessions;
    },
    SET_CURRENT_SESSION(state, session) {
      state.currentSession = session;
    },
    SET_MOVIE_SESSIONS(state, { movieId, sessions }) {
      state.movieSessions = {
        ...state.movieSessions,
        [movieId]: sessions
      };
    },
    SET_THEATER_SESSIONS(state, { theaterId, sessions }) {
      state.theaterSessions = {
        ...state.theaterSessions,
        [theaterId]: sessions
      };
    },
    SET_AVAILABLE_SEATS(state, { sessionId, seats }) {
      state.availableSeats = {
        ...state.availableSeats,
        [sessionId]: seats
      };
    },
    ADD_SESSION(state, session) {
      state.sessions.push(session);
      
      // Update movie sessions if needed
      if (session.movie_id && state.movieSessions[session.movie_id]) {
        state.movieSessions[session.movie_id].push(session);
      }
      
      // Update theater sessions if needed
      if (session.theater_id && state.theaterSessions[session.theater_id]) {
        state.theaterSessions[session.theater_id].push(session);
      }
    },
    UPDATE_SESSION(state, updatedSession) {
      // Update in sessions array
      const index = state.sessions.findIndex(session => session.id === updatedSession.id);
      if (index !== -1) {
        state.sessions.splice(index, 1, updatedSession);
      }
      
      // Update current session if needed
      if (state.currentSession && state.currentSession.id === updatedSession.id) {
        state.currentSession = updatedSession;
      }
      
      // Update in movie sessions if needed
      if (updatedSession.movie_id && state.movieSessions[updatedSession.movie_id]) {
        const movieIndex = state.movieSessions[updatedSession.movie_id].findIndex(
          session => session.id === updatedSession.id
        );
        if (movieIndex !== -1) {
          state.movieSessions[updatedSession.movie_id].splice(movieIndex, 1, updatedSession);
        }
      }
      
      // Update in theater sessions if needed
      if (updatedSession.theater_id && state.theaterSessions[updatedSession.theater_id]) {
        const theaterIndex = state.theaterSessions[updatedSession.theater_id].findIndex(
          session => session.id === updatedSession.id
        );
        if (theaterIndex !== -1) {
          state.theaterSessions[updatedSession.theater_id].splice(theaterIndex, 1, updatedSession);
        }
      }
    },
    REMOVE_SESSION(state, sessionId) {
      // Remove from sessions array
      state.sessions = state.sessions.filter(session => session.id !== sessionId);
      
      // Reset current session if needed
      if (state.currentSession && state.currentSession.id === sessionId) {
        state.currentSession = null;
      }
      
      // Remove from movie sessions
      Object.keys(state.movieSessions).forEach(movieId => {
        state.movieSessions[movieId] = state.movieSessions[movieId].filter(
          session => session.id !== sessionId
        );
      });
      
      // Remove from theater sessions
      Object.keys(state.theaterSessions).forEach(theaterId => {
        state.theaterSessions[theaterId] = state.theaterSessions[theaterId].filter(
          session => session.id !== sessionId
        );
      });
      
      // Remove available seats for this session
      if (state.availableSeats[sessionId]) {
        const { [sessionId]: _, ...rest } = state.availableSeats;
        state.availableSeats = rest;
      }
    }
  },
  
  actions: {
    async fetchSessions({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getSessions();
        commit('SET_SESSIONS', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load sessions', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchSession({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getSession(id);
        commit('SET_CURRENT_SESSION', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load session details', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchSessionsByMovie({ commit, dispatch }, movieId) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getSessionsByMovie(movieId);
        commit('SET_MOVIE_SESSIONS', { movieId, sessions: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load movie sessions', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchSessionsByTheater({ commit, dispatch }, theaterId) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getSessionsByTheater(theaterId);
        commit('SET_THEATER_SESSIONS', { theaterId, sessions: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load theater sessions', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchAvailableSeats({ commit, dispatch }, sessionId) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getAvailableSeats(sessionId);
        commit('SET_AVAILABLE_SEATS', { sessionId, seats: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load available seats', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async createSession({ commit, dispatch }, sessionData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.createSession(sessionData);
        commit('ADD_SESSION', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to create session', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async updateSession({ commit, dispatch }, { id, sessionData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.updateSession(id, sessionData);
        commit('UPDATE_SESSION', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update session', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async deleteSession({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        await api.deleteSession(id);
        commit('REMOVE_SESSION', id);
      } catch (error) {
        dispatch('setError', error.message || 'Failed to delete session', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    }
  }
};