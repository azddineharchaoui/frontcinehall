import api from '../../services/api';

export default {
  namespaced: true,
  
  state: {
    dashboardData: null,
    sessionOccupancy: [],
    movieRevenue: [],
    users: []
  },
  
  getters: {
    getDashboardData: state => state.dashboardData,
    getSessionOccupancy: state => state.sessionOccupancy,
    getMovieRevenue: state => state.movieRevenue,
    getUsers: state => state.users
  },
  
  mutations: {
    SET_DASHBOARD_DATA(state, data) {
      state.dashboardData = data;
    },
    SET_SESSION_OCCUPANCY(state, data) {
      state.sessionOccupancy = data;
    },
    SET_MOVIE_REVENUE(state, data) {
      state.movieRevenue = data;
    },
    SET_USERS(state, users) {
      state.users = users;
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(user => user.id === updatedUser.id);
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
      }
    }
  },
  
  actions: {
    async fetchDashboardData({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getDashboardData();
        commit('SET_DASHBOARD_DATA', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load dashboard data', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchSessionOccupancy({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getSessionOccupancy();
        commit('SET_SESSION_OCCUPANCY', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load session occupancy data', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchMovieRevenue({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getMovieRevenue();
        commit('SET_MOVIE_REVENUE', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load movie revenue data', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchUsers({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getUsers();
        commit('SET_USERS', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load users', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async updateUserRole({ commit, dispatch }, { userId, roleData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.updateUserRole(userId, roleData);
        commit('UPDATE_USER', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update user role', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    }
  }
};