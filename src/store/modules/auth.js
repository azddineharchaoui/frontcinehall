import api from '../../services/api';

export default {
  namespaced: true,
  
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  },
  
  getters: {
    getUser: state => state.user,
    isAuthenticated: state => state.isAuthenticated,
    isAdmin: state => state.user && state.user.role === 'admin'
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    SET_TOKEN(state, token) {
      state.token = token;
      state.isAuthenticated = !!token;
      localStorage.setItem('token', token);
    },
    LOGOUT(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
  
  actions: {
    async register({ commit, dispatch }, userData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.register(userData);
        commit('SET_USER', response.data.user);
        commit('SET_TOKEN', response.data.token);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Registration failed', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async login({ commit, dispatch }, credentials) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.login(credentials);
        commit('SET_USER', response.data.user);
        commit('SET_TOKEN', response.data.token);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Login failed', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async logout({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        await api.logout();
        commit('LOGOUT');
      } catch (error) {
        dispatch('setError', error.message || 'Logout failed', { root: true });
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async refreshToken({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.refreshToken();
        commit('SET_TOKEN', response.data.token);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Token refresh failed', { root: true });
        commit('LOGOUT');
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async getProfile({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getProfile();
        commit('SET_USER', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load profile', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async updateProfile({ commit, dispatch }, userData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.updateProfile(userData);
        commit('SET_USER', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update profile', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async deleteAccount({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        await api.deleteAccount();
        commit('LOGOUT');
      } catch (error) {
        dispatch('setError', error.message || 'Failed to delete account', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    }
  }
};