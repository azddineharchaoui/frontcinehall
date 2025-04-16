import api from '../../services/api';

export default {
  namespaced: true,
  
  state: {
    theaters: [],
    currentTheater: null,
    theatersByType: {},
    theaterSeats: {}
  },
  
  getters: {
    getAllTheaters: state => state.theaters,
    getCurrentTheater: state => state.currentTheater,
    getTheatersByType: state => type => state.theatersByType[type] || [],
    getTheaterSeats: state => theaterId => state.theaterSeats[theaterId] || []
  },
  
  mutations: {
    SET_THEATERS(state, theaters) {
      state.theaters = theaters;
    },
    SET_CURRENT_THEATER(state, theater) {
      state.currentTheater = theater;
    },
    SET_THEATERS_BY_TYPE(state, { type, theaters }) {
      state.theatersByType = {
        ...state.theatersByType,
        [type]: theaters
      };
    },
    SET_THEATER_SEATS(state, { theaterId, seats }) {
      state.theaterSeats = {
        ...state.theaterSeats,
        [theaterId]: seats
      };
    },
    ADD_THEATER(state, theater) {
      state.theaters.push(theater);
      
      // Add to theaters by type if needed
      if (theater.type && state.theatersByType[theater.type]) {
        state.theatersByType[theater.type].push(theater);
      }
    },
    UPDATE_THEATER(state, updatedTheater) {
      // Update in theaters array
      const index = state.theaters.findIndex(theater => theater.id === updatedTheater.id);
      if (index !== -1) {
        state.theaters.splice(index, 1, updatedTheater);
      }
      
      // Update current theater if needed
      if (state.currentTheater && state.currentTheater.id === updatedTheater.id) {
        state.currentTheater = updatedTheater;
      }
      
      // Update in theaters by type
      if (updatedTheater.type) {
        Object.keys(state.theatersByType).forEach(type => {
          const typeIndex = state.theatersByType[type].findIndex(
            theater => theater.id === updatedTheater.id
          );
          if (typeIndex !== -1) {
            // Remove from old type if type has changed
            if (type !== updatedTheater.type) {
              state.theatersByType[type] = state.theatersByType[type].filter(
                theater => theater.id !== updatedTheater.id
              );
            } else {
              // Update in the same type
              state.theatersByType[type].splice(typeIndex, 1, updatedTheater);
            }
          }
        });
        
        // Add to new type if it exists in store but theater wasn't there before
        if (state.theatersByType[updatedTheater.type]) {
          if (!state.theatersByType[updatedTheater.type].some(theater => theater.id === updatedTheater.id)) {
            state.theatersByType[updatedTheater.type].push(updatedTheater);
          }
        }
      }
    },
    REMOVE_THEATER(state, theaterId) {
      // Remove from theaters array
      state.theaters = state.theaters.filter(theater => theater.id !== theaterId);
      
      // Reset current theater if needed
      if (state.currentTheater && state.currentTheater.id === theaterId) {
        state.currentTheater = null;
      }
      
      // Remove from theaters by type
      Object.keys(state.theatersByType).forEach(type => {
        state.theatersByType[type] = state.theatersByType[type].filter(
          theater => theater.id !== theaterId
        );
      });
      
      // Remove seats for this theater
      if (state.theaterSeats[theaterId]) {
        const { [theaterId]: _, ...rest } = state.theaterSeats;
        state.theaterSeats = rest;
      }
    }
  },
  
  actions: {
    async fetchTheaters({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getTheaters();
        commit('SET_THEATERS', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load theaters', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchTheater({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getTheater(id);
        commit('SET_CURRENT_THEATER', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load theater details', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchTheatersByType({ commit, dispatch }, type) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getTheatersByType(type);
        commit('SET_THEATERS_BY_TYPE', { type, theaters: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || `Failed to load ${type} theaters`, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchTheaterSeats({ commit, dispatch }, theaterId) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getTheaterSeats(theaterId);
        commit('SET_THEATER_SEATS', { theaterId, seats: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load theater seats', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async createTheater({ commit, dispatch }, theaterData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.createTheater(theaterData);
        commit('ADD_THEATER', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to create theater', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async updateTheater({ commit, dispatch }, { id, theaterData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.updateTheater(id, theaterData);
        commit('UPDATE_THEATER', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update theater', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async deleteTheater({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        await api.deleteTheater(id);
        commit('REMOVE_THEATER', id);
      } catch (error) {
        dispatch('setError', error.message || 'Failed to delete theater', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    }
  }
};