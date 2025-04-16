<template>
  <div class="movies-manage-page">
    <div class="page-header">
      <h1>Gestion des Films</h1>
      <router-link to="/admin/films/nouveau" class="btn btn-primary">
        <i class="fas fa-plus"></i> Ajouter un film
      </router-link>
    </div>
    
    <div class="content-card">
      <div class="card-header">
        <div class="search-filter">
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un film..."
            @input="filterMovies"
          >
          <select v-model="genreFilter" @change="filterMovies">
            <option value="">Tous les genres</option>
            <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
          </select>
        </div>
        
        <div class="table-actions">
          <button @click="fetchMovies" class="btn btn-outline btn-refresh">
            <i class="fas fa-sync-alt"></i> Actualiser
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des films...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        {{ error }}
        <button @click="fetchMovies" class="btn btn-primary">Réessayer</button>
      </div>
      
      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th style="width: 80px;">Affiche</th>
              <th>Titre</th>
              <th>Genre</th>
              <th>Durée</th>
              <th>Statut</th>
              <th style="width: 150px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movie in filteredMovies" :key="movie.id">
              <td>{{ movie.id }}</td>
              <td>
                <img 
                  :src="movie.poster_url || 'https://via.placeholder.com/50x75'" 
                  :alt="movie.title"
                  class="movie-thumbnail"
                >
              </td>
              <td>{{ movie.title }}</td>
              <td>{{ movie.genre }}</td>
              <td>{{ movie.duration }} min</td>
              <td>
                <span :class="getStatusClass(movie.status)">
                  {{ formatStatus(movie.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <router-link 
                    :to="`/admin/films/${movie.id}/modifier`" 
                    class="btn btn-sm btn-edit"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>
                  <button 
                    @click="confirmDelete(movie)" 
                    class="btn btn-sm btn-delete"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredMovies.length === 0" class="no-results">
          Aucun film ne correspond à votre recherche.
        </div>
        
        <div class="pagination">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="btn btn-sm"
          >
            <i class="fas fa-chevron-left"></i> Précédent
          </button>
          
          <span class="pagination-info">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>
          
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="btn btn-sm"
          >
            Suivant <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button @click="showDeleteModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer le film "{{ movieToDelete?.title }}" ?</p>
          <p class="warning-text">Cette action est irréversible et supprimera également toutes les séances associées à ce film.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-outline">Annuler</button>
          <button @click="deleteMovie" class="btn btn-delete">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { movieService } from '../../services/movieService'
import { adminService } from '../../services/adminService'

// État
const movies = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const genreFilter = ref('')
const currentPage = ref(1)
const totalMovies = ref(0)
const perPage = ref(10)
const showDeleteModal = ref(false)
const movieToDelete = ref(null)

// Fonctions
async function fetchMovies() {
  loading.value = true
  error.value = null
  
  try {
    const response = await movieService.getAllMovies({
      page: currentPage.value,
      per_page: perPage.value
    })
    
    movies.value = response.data.data || response.data
    totalMovies.value = response.data.meta?.total || movies.value.length
  } catch (err) {
    error.value = "Erreur lors du chargement des films. Veuillez réessayer."
    console.error('Error fetching movies:', err)
  } finally {
    loading.value = false
  }
}

function filterMovies() {
  // Pour un filtrage côté client simple
  // Dans une application réelle, vous enverriez ces filtres au backend
  currentPage.value = 1
  fetchMovies()
}

function changePage(page) {
  currentPage.value = page
  fetchMovies()
}

function confirmDelete(movie) {
  movieToDelete.value = movie
  showDeleteModal.value = true
}

async function deleteMovie() {
  if (!movieToDelete.value) return
  
  try {
    await adminService.deleteMovie(movieToDelete.value.id)
    showDeleteModal.value = false
    movieToDelete.value = null
    
    // Actualiser la liste
    fetchMovies()
  } catch (err) {
    console.error('Error deleting movie:', err)
    // Afficher une erreur
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'active':
      return 'status-active'
    case 'upcoming':
      return 'status-upcoming'
    case 'ended':
      return 'status-ended'
    default:
      return ''
  }
}

function formatStatus(status) {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'upcoming':
      return 'À venir'
    case 'ended':
      return 'Terminé'
    default:
      return status || 'Inconnu'
  }
}

// Computed
const totalPages = computed(() => {
  return Math.ceil(totalMovies.value / perPage.value)
})

const genres = computed(() => {
  const allGenres = movies.value.map(movie => movie.genre).filter(Boolean)
  return [...new Set(allGenres)]
})

const filteredMovies = computed(() => {
  return movies.value
})

// Cycle de vie
onMounted(() => {
  fetchMovies()
})
</script>

<style scoped>
.movies-manage-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--secondary-color);
}

.content-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-filter {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 300px;
}

.search-filter input, .search-filter select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

.search-filter input {
  flex: 1;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-outline {
  background-color: transparent;
  color: var(--secondary-color);
  border: 1px solid #ddd;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 0.85rem;
}

.btn-edit {
  background-color: #4caf50;
  color: white;
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.loading-container, .error-container, .no-results {
  padding: 50px 20px;
  text-align: center;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  color: #f44336;
}

.error-container button {
  margin-top: 15px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f9f9f9;
  font-weight: 600;
}

.movie-thumbnail {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: 3px;
}

.status-active {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status-upcoming {
  color: #2196f3;
  background-color: rgba(33, 150, 243, 0.1);
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status-ended {
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.1);
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.pagination-info {
  font-size: 0.95rem;
  color: #666;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.warning-text {
  color: #f44336;
  font-style: italic;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    flex-direction: column;
  }
  
  .data-table {
    display: block;
    overflow-x: auto;
  }
}
</style>