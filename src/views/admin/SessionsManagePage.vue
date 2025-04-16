<template>
  <div class="sessions-manage-page">
    <div class="page-header">
      <h1>Gestion des Séances</h1>
      <router-link to="/admin/seances/nouvelle" class="btn btn-primary">
        <i class="fas fa-plus"></i> Ajouter une séance
      </router-link>
    </div>
    
    <div class="content-card">
      <div class="card-header">
        <div class="search-filter">
          <select v-model="movieFilter" @change="filterSessions">
            <option value="">Tous les films</option>
            <option v-for="movie in movies" :key="movie.id" :value="movie.id">
              {{ movie.title }}
            </option>
          </select>
          
          <select v-model="theaterFilter" @change="filterSessions">
            <option value="">Toutes les salles</option>
            <option v-for="theater in theaters" :key="theater.id" :value="theater.id">
              {{ theater.name }}
            </option>
          </select>
          
          <select v-model="dateFilter" @change="filterSessions">
            <option value="">Toutes les dates</option>
            <option v-for="date in availableDates" :key="date" :value="date">
              {{ formatDate(date) }}
            </option>
          </select>
        </div>
        
        <div class="table-actions">
          <button @click="fetchSessions" class="btn btn-outline btn-refresh">
            <i class="fas fa-sync-alt"></i> Actualiser
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des séances...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        {{ error }}
        <button @click="fetchSessions" class="btn btn-primary">Réessayer</button>
      </div>
      
      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Film</th>
              <th>Date & Heure</th>
              <th>Salle</th>
              <th>Type</th>
              <th>Places</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in filteredSessions" :key="session.id">
              <td>{{ session.id }}</td>
              <td>
                <div class="movie-info">
                  <img 
                    :src="session.movie?.poster_url || 'https://via.placeholder.com/40x60'" 
                    :alt="session.movie?.title"
                    class="movie-thumbnail"
                  >
                  <span>{{ session.movie?.title }}</span>
                </div>
              </td>
              <td>{{ formatDate(session.date) }} à {{ session.time }}</td>
              <td>{{ session.theater?.name || `Salle ${session.theater_room || session.room}` }}</td>
              <td>
                <span :class="`session-type ${session.type?.toLowerCase()}`">
                  {{ session.type }}
                </span>
              </td>
              <td>
                <div class="seats-info">
                  <div class="seats-bar">
                    <div 
                      class="seats-filled"
                      :style="{ width: `${calculateOccupancy(session)}%` }"
                      :class="{ 'high': getOccupancyRate(session) > 80 }"
                    ></div>
                  </div>
                  <span>{{ session.occupied_seats || 0 }}/{{ session.total_seats || 0 }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <router-link 
                    :to="`/admin/seances/${session.id}/modifier`" 
                    class="btn btn-sm btn-edit"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>
                  <button 
                    @click="confirmDelete(session)" 
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
        
        <div v-if="filteredSessions.length === 0" class="no-results">
          Aucune séance ne correspond à votre recherche.
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
          <p>Êtes-vous sûr de vouloir supprimer cette séance ?</p>
          <div class="session-details">
            <p><strong>Film:</strong> {{ sessionToDelete?.movie?.title }}</p>
            <p><strong>Date:</strong> {{ formatDate(sessionToDelete?.date) }} à {{ sessionToDelete?.time }}</p>
            <p><strong>Salle:</strong> {{ sessionToDelete?.theater?.name || `Salle ${sessionToDelete?.theater_room || sessionToDelete?.room}` }}</p>
          </div>
          <p class="warning-text">Cette action est irréversible et supprimera également toutes les réservations associées.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-outline">Annuler</button>
          <button @click="deleteSession" class="btn btn-delete">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '../../services/adminService'
import { movieService } from '../../services/movieService'

// État
const sessions = ref([])
const movies = ref([])
const theaters = ref([])
const loading = ref(true)
const error = ref(null)
const movieFilter = ref('')
const theaterFilter = ref('')
const dateFilter = ref('')
const currentPage = ref(1)
const totalSessions = ref(0)
const perPage = ref(10)
const showDeleteModal = ref(false)
const sessionToDelete = ref(null)

// Computed
const filteredSessions = computed(() => {
  let filtered = sessions.value
  
  if (movieFilter.value) {
    filtered = filtered.filter(session => 
      session.movie?.id === parseInt(movieFilter.value) ||
      session.movie_id === parseInt(movieFilter.value)
    )
  }
  
  if (theaterFilter.value) {
    filtered = filtered.filter(session => 
      session.theater?.id === parseInt(theaterFilter.value) ||
      session.theater_id === parseInt(theaterFilter.value)
    )
  }
  
  if (dateFilter.value) {
    filtered = filtered.filter(session => 
      session.date === dateFilter.value
    )
  }
  
  return filtered
})

const availableDates = computed(() => {
  const dates = sessions.value.map(session => session.date)
  return [...new Set(dates)].sort()
})

const totalPages = computed(() => {
  return Math.ceil(filteredSessions.value.length / perPage.value)
})

// Méthodes
async function fetchSessions() {
  loading.value = true
  error.value = null
  
  try {
    const response = await movieService.getAllSessions()
    sessions.value = response.data.data || response.data
    totalSessions.value = sessions.value.length
    
    // Charger les films et salles pour les filtres
    await fetchMoviesAndTheaters()
  } catch (err) {
    error.value = "Erreur lors du chargement des séances. Veuillez réessayer."
    console.error('Error fetching sessions:', err)
  } finally {
    loading.value = false
  }
}

async function fetchMoviesAndTheaters() {
  try {
    const [moviesResponse, theatersResponse] = await Promise.all([
      movieService.getAllMovies(),
      adminService.getAllTheaters()
    ])
    
    movies.value = moviesResponse.data.data || moviesResponse.data
    theaters.value = theatersResponse.data.data || theatersResponse.data
  } catch (err) {
    console.error('Error fetching movies and theaters:', err)
  }
}

function filterSessions() {
  // Handled by computed property
  currentPage.value = 1
}

function changePage(page) {
  currentPage.value = page
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

function calculateOccupancy(session) {
  if (!session.total_seats) return 0
  return Math.round((session.occupied_seats / session.total_seats) * 100)
}

function getOccupancyRate(session) {
  if (!session.total_seats) return 0
  return Math.round((session.occupied_seats / session.total_seats) * 100)
}

function confirmDelete(session) {
  sessionToDelete.value = session
  showDeleteModal.value = true
}

async function deleteSession() {
  if (!sessionToDelete.value) return
  
  try {
    await adminService.deleteSession(sessionToDelete.value.id)
    showDeleteModal.value = false
    sessionToDelete.value = null
    
    // Actualiser la liste
    fetchSessions()
  } catch (err) {
    console.error('Error deleting session:', err)
    // Afficher une erreur
  }
}

// Cycle de vie
onMounted(() => {
  fetchSessions()
})
</script>

<style scoped>
.sessions-manage-page {
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
  flex-wrap: wrap;
}

.search-filter select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  min-width: 180px;
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  text-align: center;
  color: #666;
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
  padding: 30px;
  text-align: center;
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

.movie-info {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 250px;
}

.movie-thumbnail {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 3px;
}

.movie-info span {
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.session-type {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.session-type.normal {
  background-color: #e3f2fd;
  color: #1565c0;
}

.session-type.vip {
  background-color: #fff8e1;
  color: #ff8f00;
}

.seats-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.seats-bar {
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
}

.seats-filled {
  height: 100%;
  background-color: #4caf50;
  border-radius: 3px;
}

.seats-filled.high {
  background-color: #f44336;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.no-results {
  padding: 30px;
  text-align: center;
  color: #666;
  font-style: italic;
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
  font-size: 1.2rem;
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

.session-details {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
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