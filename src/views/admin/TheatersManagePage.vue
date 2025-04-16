<template>
  <div class="theaters-manage-page">
    <div class="page-header">
      <h1>Gestion des Salles</h1>
      <router-link to="/admin/salles/nouvelle" class="btn btn-primary">
        <i class="fas fa-plus"></i> Ajouter une salle
      </router-link>
    </div>
    
    <div class="content-card">
      <div class="card-header">
        <div class="search-filter">
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher une salle..."
            @input="filterTheaters"
          >
          <select v-model="typeFilter" @change="filterTheaters">
            <option value="">Tous les types</option>
            <option value="normal">Normal</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        
        <div class="table-actions">
          <button @click="fetchTheaters" class="btn btn-outline btn-refresh">
            <i class="fas fa-sync-alt"></i> Actualiser
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des salles...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        {{ error }}
        <button @click="fetchTheaters" class="btn btn-primary">Réessayer</button>
      </div>
      
      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Capacité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="theater in filteredTheaters" :key="theater.id">
              <td>{{ theater.id }}</td>
              <td>{{ theater.name }}</td>
              <td>
                <span :class="`theater-type ${theater.type.toLowerCase()}`">
                  {{ theater.type }}
                </span>
              </td>
              <td>{{ theater.capacity }} places</td>
              <td>
                <span :class="getStatusClass(theater.status)">
                  {{ formatStatus(theater.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <router-link 
                    :to="`/admin/salles/${theater.id}/modifier`" 
                    class="btn btn-sm btn-edit"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>
                  <button 
                    @click="viewSeats(theater)" 
                    class="btn btn-sm btn-view"
                    title="Voir les sièges"
                  >
                    <i class="fas fa-chair"></i>
                  </button>
                  <button 
                    @click="confirmDelete(theater)" 
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
        
        <div v-if="filteredTheaters.length === 0" class="no-results">
          Aucune salle ne correspond à votre recherche.
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button @click="showDeleteModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer la salle "{{ theaterToDelete?.name }}" ?</p>
          <p class="warning-text">Cette action est irréversible et supprimera également toutes les séances programmées dans cette salle.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-outline">Annuler</button>
          <button @click="deleteTheater" class="btn btn-delete">Supprimer</button>
        </div>
      </div>
    </div>
    
    <!-- Modal d'affichage des sièges -->
    <div v-if="showSeatsModal" class="modal-overlay">
      <div class="modal-container seats-modal">
        <div class="modal-header">
          <h3>Sièges de la salle: {{ currentTheater?.name }}</h3>
          <button @click="showSeatsModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingSeats" class="loading-container">
            <div class="spinner"></div>
            <p>Chargement des sièges...</p>
          </div>
          <div v-else-if="seatsError" class="error-message">
            {{ seatsError }}
          </div>
          <div v-else>
            <div class="seats-container">
              <div class="screen">Écran</div>
              <div class="seating-plan">
                <div 
                  v-for="seat in theaterSeats" 
                  :key="seat.id" 
                  class="seat"
                  :class="{
                    'seat-couple': seat.type === 'couple',
                    'seat-vip': currentTheater?.type === 'VIP'
                  }"
                >
                  {{ seat.row }}{{ seat.number }}
                </div>
              </div>
              
              <div class="seat-legend">
                <div class="legend-item">
                  <div class="legend-icon seat"></div>
                  <span>Siège standard</span>
                </div>
                <div class="legend-item" v-if="hasCoupleSeat">
                  <div class="legend-icon seat seat-couple"></div>
                  <span>Siège couple</span>
                </div>
                <div class="legend-item" v-if="currentTheater?.type === 'VIP'">
                  <div class="legend-icon seat seat-vip"></div>
                  <span>Siège VIP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showSeatsModal = false" class="btn btn-outline">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '../../services/adminService'

// État
const theaters = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const typeFilter = ref('')
const showDeleteModal = ref(false)
const theaterToDelete = ref(null)
const showSeatsModal = ref(false)
const currentTheater = ref(null)
const theaterSeats = ref([])
const loadingSeats = ref(false)
const seatsError = ref(null)

// Computed
const filteredTheaters = computed(() => {
  let filtered = theaters.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(theater => 
      theater.name.toLowerCase().includes(query)
    )
  }

  if (typeFilter.value) {
    filtered = filtered.filter(theater => 
      theater.type.toLowerCase() === typeFilter.value.toLowerCase()
    )
  }

  return filtered
})

const hasCoupleSeat = computed(() => {
  return theaterSeats.value.some(seat => seat.type === 'couple')
})

// Méthodes
async function fetchTheaters() {
  loading.value = true
  error.value = null
  
  try {
    const response = await adminService.getAllTheaters()
    theaters.value = response.data.data || response.data
  } catch (err) {
    error.value = "Erreur lors du chargement des salles. Veuillez réessayer."
    console.error('Error fetching theaters:', err)
  } finally {
    loading.value = false
  }
}

function filterTheaters() {
  // Le filtrage est géré par le computed property
}

function getStatusClass(status) {
  switch (status) {
    case 'active':
      return 'status-active'
    case 'maintenance':
      return 'status-maintenance'
    case 'inactive':
      return 'status-inactive'
    default:
      return ''
  }
}

function formatStatus(status) {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'maintenance':
      return 'En maintenance'
    case 'inactive':
      return 'Inactif'
    default:
      return status || 'Inconnu'
  }
}

function confirmDelete(theater) {
  theaterToDelete.value = theater
  showDeleteModal.value = true
}

async function deleteTheater() {
  if (!theaterToDelete.value) return
  
  try {
    await adminService.deleteTheater(theaterToDelete.value.id)
    showDeleteModal.value = false
    theaterToDelete.value = null
    
    // Actualiser la liste
    fetchTheaters()
  } catch (err) {
    console.error('Error deleting theater:', err)
    // Afficher une erreur
  }
}

async function viewSeats(theater) {
  currentTheater.value = theater
  showSeatsModal.value = true
  loadingSeats.value = true
  seatsError.value = null
  
  try {
    const response = await adminService.getTheaterSeats(theater.id)
    theaterSeats.value = response.data
  } catch (err) {
    seatsError.value = "Impossible de charger les sièges."
    console.error('Error fetching seats:', err)
  } finally {
    loadingSeats.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchTheaters()
})
</script>

<style scoped>
.theaters-manage-page {
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

.btn-view {
  background-color: #2196f3;
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

.theater-type {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.theater-type.normal {
  background-color: #e3f2fd;
  color: #1565c0;
}

.theater-type.vip {
  background-color: #fff8e1;
  color: #ff8f00;
}

.status-active {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status-maintenance {
  color: #ff9800;
  background-color: rgba(255, 152, 0, 0.1);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status-inactive {
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.1);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.85rem;
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

.seats-modal {
  max-width: 700px;
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

/* Seats styling */
.seats-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen {
  width: 80%;
  height: 25px;
  background-color: #eee;
  margin: 0 auto 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #777;
  border-radius: 5px;
  transform: perspective(200px) rotateX(-10deg);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.seating-plan {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  margin-bottom: 30px;
  width: 100%;
}

.seat {
  aspect-ratio: 1;
  background-color: #a1c8ee;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.8rem;
}

.seat-couple {
  background-color: #f8bbd0;
}

.seat-vip {
  background-color: #ffecb3;
  border: 2px solid #ffc107;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.legend-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.error-message {
  color: #f44336;
  text-align: center;
  padding: 20px;
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
  
  .seating-plan {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>