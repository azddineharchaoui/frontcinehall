<template>
  <div class="users-manage-page">
    <div class="page-header">
      <h1>Gestion des Utilisateurs</h1>
    </div>
    
    <div class="content-card">
      <div class="card-header">
        <div class="search-filter">
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un utilisateur..."
            @input="filterUsers"
          >
          <select v-model="roleFilter" @change="filterUsers">
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="user">Utilisateurs</option>
          </select>
        </div>
        
        <div class="table-actions">
          <button @click="fetchUsers" class="btn btn-outline btn-refresh">
            <i class="fas fa-sync-alt"></i> Actualiser
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des utilisateurs...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        {{ error }}
        <button @click="fetchUsers" class="btn btn-primary">Réessayer</button>
      </div>
      
      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="`role-badge ${user.role}`">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="changeRole(user)" 
                    class="btn btn-sm btn-edit"
                    :disabled="user.id === currentUserId"
                    title="Modifier le rôle"
                  >
                    <i class="fas fa-user-shield"></i>
                  </button>
                  <button 
                    @click="viewUserDetails(user)" 
                    class="btn btn-sm btn-view"
                    title="Voir les détails"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredUsers.length === 0" class="no-results">
          Aucun utilisateur ne correspond à votre recherche.
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
    
    <!-- Modal pour changer le rôle -->
    <div v-if="showRoleModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Modifier le rôle utilisateur</h3>
          <button @click="showRoleModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Modifier le rôle de <strong>{{ userToEdit?.name }}</strong> ({{ userToEdit?.email }})</p>
          
          <div class="form-group">
            <label for="role">Sélectionner un rôle</label>
            <select id="role" v-model="selectedRole">
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <div v-if="selectedRole === 'admin'" class="role-warning">
            <p>⚠️ Attention: Le rôle administrateur donne un accès complet au système de gestion.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showRoleModal = false" class="btn btn-outline">Annuler</button>
          <button @click="updateUserRole" class="btn btn-primary" :disabled="isUpdating">
            {{ isUpdating ? 'Modification...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal pour les détails utilisateur -->
    <div v-if="showDetailsModal" class="modal-overlay">
      <div class="modal-container details-modal">
        <div class="modal-header">
          <h3>Détails de l'utilisateur</h3>
          <button @click="showDetailsModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingUserDetails" class="loading-container">
            <div class="spinner"></div>
            <p>Chargement des détails...</p>
          </div>
          <div v-else class="user-details">
            <div class="user-header">
              <div class="user-avatar">{{ getUserInitials(selectedUser) }}</div>
              <div class="user-basic-info">
                <h4>{{ selectedUser?.name }}</h4>
                <p>{{ selectedUser?.email }}</p>
                <span :class="`role-badge ${selectedUser?.role}`">
                  {{ formatRole(selectedUser?.role) }}
                </span>
              </div>
            </div>
            
            <div class="stats-section">
              <div class="stat-item">
                <div class="stat-value">{{ userStats.totalReservations || 0 }}</div>
                <div class="stat-label">Réservations</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userStats.totalTickets || 0 }}</div>
                <div class="stat-label">Billets</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatPrice(userStats.totalSpent || 0) }}</div>
                <div class="stat-label">Dépenses</div>
              </div>
            </div>
            
            <div class="details-section">
              <h4>Dernières réservations</h4>
              <div v-if="userReservations.length === 0" class="empty-state">
                Aucune réservation trouvée.
              </div>
              <div v-else class="reservations-list">
                <div v-for="reservation in userReservations" :key="reservation.id" class="reservation-item">
                  <div class="reservation-movie">{{ reservation.session?.movie?.title }}</div>
                  <div class="reservation-date">{{ formatDate(reservation.session?.date) }}</div>
                  <div class="reservation-status" :class="reservation.status">{{ formatStatus(reservation.status) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showDetailsModal = false" class="btn btn-outline">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '../../services/adminService'
import { authService } from '../../services/authService'
import { reservationService } from '../../services/reservationService'

// État
const users = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const totalUsers = ref(0)
const currentUserId = ref(null)

// Modals
const showRoleModal = ref(false)
const userToEdit = ref(null)
const selectedRole = ref('user')
const isUpdating = ref(false)

const showDetailsModal = ref(false)
const selectedUser = ref(null)
const loadingUserDetails = ref(false)
const userReservations = ref([])
const userStats = ref({
  totalReservations: 0,
  totalTickets: 0,
  totalSpent: 0
})

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    )
  }
  
  if (roleFilter.value) {
    filtered = filtered.filter(user => 
      user.role === roleFilter.value
    )
  }
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / perPage.value)
})

// Méthodes
async function fetchUsers() {
  loading.value = true
  error.value = null
  
  try {
    const response = await adminService.getUsers()
    users.value = response.data.data || response.data
    totalUsers.value = users.value.length
    
    // Get current user ID to prevent self-modification
    const currentUser = authService.getUser()
    if (currentUser) {
      currentUserId.value = currentUser.id
    }
  } catch (err) {
    error.value = "Erreur lors du chargement des utilisateurs. Veuillez réessayer."
    console.error('Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

function filterUsers() {
  // Handled by computed property
  currentPage.value = 1
}

function changePage(page) {
  currentPage.value = page
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  const options = { day: 'numeric', month: 'short', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

function formatRole(role) {
  switch (role) {
    case 'admin':
      return 'Administrateur'
    case 'user':
      return 'Utilisateur'
    default:
      return role || 'Inconnu'
  }
}

function formatStatus(status) {
  switch (status) {
    case 'pending':
      return 'En attente'
    case 'paid':
      return 'Payé'
    case 'cancelled':
      return 'Annulé'
    case 'expired':
      return 'Expiré'
    default:
      return status || 'Inconnu'
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

function changeRole(user) {
  userToEdit.value = user
  selectedRole.value = user.role
  showRoleModal.value = true
}

async function updateUserRole() {
  if (!userToEdit.value) return
  
  isUpdating.value = true
  
  try {
    await adminService.updateUserRole(userToEdit.value.id, selectedRole.value)
    
    // Update the user in the list
    const index = users.value.findIndex(u => u.id === userToEdit.value.id)
    if (index !== -1) {
      users.value[index].role = selectedRole.value
    }
    
    showRoleModal.value = false
  } catch (err) {
    console.error('Error updating user role:', err)
    // Afficher une erreur
  } finally {
    isUpdating.value = false
  }
}

async function viewUserDetails(user) {
  selectedUser.value = user
  showDetailsModal.value = true
  loadingUserDetails.value = true
  
  try {
    // In a real app, you'd call an API endpoint to get user-specific data
    // Here we're simulating it with the existing endpoints
    
    // Get the user's reservations
    const reservationsResponse = await reservationService.getUserReservations()
    userReservations.value = reservationsResponse.data.slice(0, 5) // Just get the most recent 5
    
    // Calculate stats
    userStats.value = {
      totalReservations: userReservations.value.length,
      totalTickets: userReservations.value.reduce((total, res) => total + (res.seats?.length || 0), 0),
      totalSpent: userReservations.value.reduce((total, res) => {
        // Sum up the price of tickets (price per session * number of seats)
        return total + ((res.session?.price || 0) * (res.seats?.length || 0))
      }, 0)
    }
  } catch (err) {
    console.error('Error fetching user details:', err)
  } finally {
    loadingUserDetails.value = false
  }
}

function getUserInitials(user) {
  if (!user || !user.name) return ''
  
  return user.name
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

// Lifecycle hooks
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-manage-page {
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.role-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-badge.admin {
  background-color: #e3f2fd;
  color: #1565c0;
}

.role-badge.user {
  background-color: #e8f5e9;
  color: #2e7d32;
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

.details-modal {
  max-width: 600px;
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

.modal-body .form-group {
  margin-bottom: 20px;
}

.modal-body .form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.modal-body .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.role-warning {
  background-color: #fff3cd;
  padding: 10px 15px;
  border-radius: 4px;
  color: #856404;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* User Details Modal */
.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.user-avatar {
  width: 70px;
  height: 70px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
}

.user-basic-info h4 {
  margin: 0 0 5px 0;
  font-size: 1.3rem;
}

.user-basic-info p {
  margin: 0 0 10px 0;
  color: #666;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  gap: 15px;
  margin-bottom: 30px;
  text-align: center;
}

.stat-item {
  flex: 1;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary-color);
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.details-section {
  margin-top: 15px;
}

.details-section h4 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 15px;
  color: #666;
  font-style: italic;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reservation-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  align-items: center;
}

.reservation-movie {
  font-weight: 500;
  flex: 1;
}

.reservation-date {
  color: #666;
  margin: 0 15px;
}

.reservation-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.reservation-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.reservation-status.paid {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.reservation-status.cancelled, .reservation-status.expired {
  background-color: #ffebee;
  color: #b71c1c;
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
  
  .stats-section {
    flex-direction: column;
  }
  
  .reservation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .reservation-date {
    margin: 0;
  }
}
</style>