import { createStore } from 'vuex';
import api from '../services/api';
import auth from './modules/auth';
import movies from './modules/movies';
import sessions from './modules/sessions';
import reservations from './modules/reservations';
import theaters from './modules/theaters';
import admin from './modules/admin';

export default createStore({
  state: {
    loading: false,
    error: null
  },
  
  getters: {
    isLoading: state => state.loading,
    getError: state => state.error
  },
  
  mutations: {
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  
  actions: {
    setLoading({ commit }, status) {
      commit('SET_LOADING', status);
    },
    setError({ commit }, error) {
      commit('SET_ERROR', error);
    },
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },
  
  modules: {
    auth,
    movies,
    sessions,
    reservations,
    theaters,
    admin
  }
});