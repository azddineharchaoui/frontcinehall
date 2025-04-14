<template>
  <div class="movie-list-container">
    <div class="filters">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Rechercher un film..." 
          @input="applyFilters"
        />
      </div>
      
      <div class="filter-options">
        <select v-model="selectedGenre" @change="applyFilters">
          <option value="">Tous les genres</option>
          <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
        </select>
        
        <select v-model="sortBy" @change="applyFilters">
          <option value="newest">Les plus récents</option>
          <option value="rating">Mieux notés</option>
          <option value="title">Alphabétique</option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      Chargement des films...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else-if="movies.length === 0" class="no-results">
      Aucun film ne correspond à votre recherche.
    </div>
    
    <div v-else class="movie-grid">
      <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
    </div>
    
    <div v-if="movies.length > 0" class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="changePage(currentPage - 1)" 
        class="page-btn"
      >
        Précédent
      </button>
      
      <span class="page-info">Page {{ currentPage }} sur {{ totalPages }}</span>
      
      <button 
        :disabled="currentPage === totalPages" 
        @click="changePage(currentPage + 1)" 
        class="page-btn"
      >
        Suivant
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MovieCard from './MovieCard.vue'
import { movieService } from '../services/movieService'

// State
const loading = ref(false)
const error = ref(null)
const movies = ref([])
const totalMovies = ref(0)
const currentPage = ref(1)
const perPage = ref(12)
const searchQuery = ref('')
const selectedGenre = ref('')
const sortBy = ref('newest')
const genres = ref([])

// Computed
const totalPages = computed(() => Math.ceil(totalMovies.value / perPage.value))

// Methods
async function fetchMovies() {
  loading.value = true
  error.value = null
  
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      search: searchQuery.value,
      genre: selectedGenre.value,
      sort_by: sortBy.value
    }
    
    const response = await movieService.getMovies(params)
    movies.value = response.data.data
    totalMovies.value = response.data.meta.total
    
    if (!genres.value.length && response.data.genres) {
      genres.value = response.data.genres
    }
  } catch (err) {
    error.value = "Impossible de charger les films. Veuillez réessayer plus tard."
    console.error('Error fetching movies:', err)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  currentPage.value = 1
  fetchMovies()
}

function changePage(page) {
  currentPage.value = page
  fetchMovies()
}

// Lifecycle hooks
onMounted(() => {
  fetchMovies()
})
</script>

<style scoped>
.movie-list-container {
  margin-bottom: 30px;
}

.filters {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 15px;
}

.search-bar input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 30px;
  font-size: 1rem;
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-options select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: white;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.loading, .error-message, .no-results {
  text-align: center;
  padding: 30px;
  font-size: 1.1rem;
}

.error-message {
  color: var(--primary-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 15px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
}
</style>