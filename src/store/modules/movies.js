import api from '../../services/api';
export default {
  namespaced: true,
  
  state: {
    movies: [],
    popularMovies: [],
    currentMovie: null,
    genreMovies: {}
  },
  
  getters: {
    getAllMovies: state => state.movies,
    getPopularMovies: state => state.popularMovies,
    getCurrentMovie: state => state.currentMovie,
    getMoviesByGenre: state => genre => state.genreMovies[genre] || []
  },
  
  mutations: {
    SET_MOVIES(state, movies) {
      state.movies = movies;
    },
    SET_POPULAR_MOVIES(state, movies) {
      state.popularMovies = movies;
    },
    SET_CURRENT_MOVIE(state, movie) {
      state.currentMovie = movie;
    },
    SET_GENRE_MOVIES(state, { genre, movies }) {
      state.genreMovies = {
        ...state.genreMovies,
        [genre]: movies
      };
    },
    ADD_MOVIE(state, movie) {
      state.movies.push(movie);
    },
    UPDATE_MOVIE(state, updatedMovie) {
      const index = state.movies.findIndex(movie => movie.id === updatedMovie.id);
      if (index !== -1) {
        state.movies.splice(index, 1, updatedMovie);
      }
      if (state.currentMovie && state.currentMovie.id === updatedMovie.id) {
        state.currentMovie = updatedMovie;
      }
    },
    REMOVE_MOVIE(state, movieId) {
      state.movies = state.movies.filter(movie => movie.id !== movieId);
      if (state.currentMovie && state.currentMovie.id === movieId) {
        state.currentMovie = null;
      }
    }
  },
  
  actions: {
    async fetchMovies({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getMovies();
        commit('SET_MOVIES', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load movies', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchPopularMovies({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getPopularMovies();
        commit('SET_POPULAR_MOVIES', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load popular movies', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchMovie({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getMovie(id);
        commit('SET_CURRENT_MOVIE', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load movie details', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async fetchMoviesByGenre({ commit, dispatch }, genre) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getMoviesByGenre(genre);
        commit('SET_GENRE_MOVIES', { genre, movies: response.data });
        return response;
      } catch (error) {
        dispatch('setError', error.message || `Failed to load ${genre} movies`, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async createMovie({ commit, dispatch }, movieData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.createMovie(movieData);
        commit('ADD_MOVIE', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to create movie', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async updateMovie({ commit, dispatch }, { id, movieData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.updateMovie(id, movieData);
        commit('UPDATE_MOVIE', response.data);
        return response;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update movie', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    async deleteMovie({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        await api.deleteMovie(id);
        commit('REMOVE_MOVIE', id);
      } catch (error) {
        dispatch('setError', error.message || 'Failed to delete movie', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    }
  }
};