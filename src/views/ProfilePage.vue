<template>
  <div class="profile-page container">
    <div class="page-header">
      <h1>Mon profil</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement de votre profil...</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchUserData" class="btn btn-retry">Réessayer</button>
    </div>

    <div v-else class="profile-content">
      <div class="profile-sidebar">
        <div class="profile-card">
          <div class="profile-avatar">
            {{ userInitials }}
          </div>
          <h3 class="profile-name">{{ user.name }}</h3>
          <p class="profile-email">{{ user.email }}</p>
          <p class="profile-member">Membre depuis {{ formatDate(user.created_at) }}</p>
          
          <div class="profile-actions">
            <button class="btn btn-outline btn-full">Modifier le profil</button>
            <button @click="handleLogout" class="btn btn-danger btn-full">Déconnexion</button>
          </div>
        </div>
        
        <div class="profile-menu">
          <button 
            @click="activeTab = 'bookings'" 
            class="menu-item"
            :class="{ 'active': activeTab === 'bookings' }"
          >
            <i class="fas fa-ticket-alt"></i> Mes réservations
          </button>
          <button 
            @click="activeTab = 'favorites'" 
            class="menu-item"
            :class="{ 'active': activeTab === 'favorites' }"
          >
            <i class="fas fa-heart"></i> Mes favoris
          </button>
          <button 
            @click="activeTab = 'settings'" 
            class="menu-item"
            :class="{ 'active': activeTab === 'settings' }"
          >
            <i class="fas fa-cog"></i> Paramètres
          </button>
        </div>
      </div>

      <div class="profile-main">
        <!-- Bookings Tab -->
        <div v-if="activeTab === 'bookings'" class="tab-content">
          <h2>Mes réservations</h2>
          
          <div v-if="loadingBookings" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement de vos réservations...</p>
          </div>
          
          <div v-else-if="bookingsError" class="error-message">
            {{ bookingsError }}
          </div>
          
          <div v-else-if="bookings.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <h3>Aucune réservation</h3>
            <p>Vous n'avez pas encore de réservation.</p>
            <router-link to="/films" class="btn">Voir les films à l'affiche</router-link>
          </div>
          
          <div v-else class="bookings-list">
            <div v-for="booking in bookings" :key="booking.id" class="booking-card">
              <div class="booking-movie-image">
                <img :src="booking.movie.poster_url || 'https://via.placeholder.com/150x225'" :alt="booking.movie.title">
              </div>
              <div class="booking-info">
                <h3>{{ booking.movie.title }}</h3>
                <p class="booking-date">
                  <i class="fas fa-calendar"></i> {{ formatDate(booking.showtime.date) }} à {{ booking.showtime.time }}
                </p>
                <p class="booking-seats">
                  <i class="fas fa-chair"></i> {{ booking.seats.length }} place(s) - Salle {{ booking.showtime.room }}
                </p>
                <p class="booking-reference">
                  <i class="fas fa-hashtag"></i> Référence: {{ booking.reference }}
                </p>
                <div class="booking-status" :class="{ 'status-upcoming': isUpcoming(booking.showtime.date) }">
                  {{ isUpcoming(booking.showtime.date) ? 'À venir' : 'Passé' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Favorites Tab -->
        <div v-else-if="activeTab === 'favorites'" class="tab-content">
          <h2>Mes films favoris</h2>
          
          <div class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-heart"></i>
            </div>
            <h3>Aucun favori</h3>
            <p>Vous n'avez pas encore ajouté de films à vos favoris.</p>
            <router-link to="/films" class="btn">Voir les films à l'affiche</router-link>
          </div>
        </div>
        
        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="tab-content">
          <h2>Paramètres</h2>
          
          <div class="settings-section">
            <h3>Informations personnelles</h3>
            
            <form @submit.prevent="updateProfile" class="settings-form">
              <div class="form-group">
                <label for="name">Nom complet</label>
                <input type="text" id="name" v-model="userForm.name">
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="userForm.email">
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn">Mettre à jour</button>
              </div>
            </form>
          </div>
          
          <div class="settings-section">
            <h3>Changer de mot de passe</h3>
            
            <form @submit.prevent="updatePassword" class="settings-form">
              <div class="form-group">
                <label for="current-password">Mot de passe actuel</label>
                <input type="password" id="current-password" v-model="passwordForm.currentPassword">
              </div>
              
              <div class="form-group">
                <label for="new-password">Nouveau mot de passe</label>
                <input type="password" id="new-password" v-model="passwordForm.newPassword">
              </div>
              
              <div class="form-group">
                <label for="confirm-password">Confirmer le mot de passe</label>
                <input type="password" id="confirm-password" v-model="passwordForm.confirmPassword">
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn">Changer le mot de passe</button>
              </div>
            </form>
          </div>
          
          <div class="settings-section">
            <h3>Préférences de notification</h3>
            
            <div class="settings-options">
              <div class="setting-toggle">
                <span>Notifications par email</span>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="preferences.emailNotifications">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-toggle">
                <span>Rappels de séances</span>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="preferences.sessionReminders">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-toggle">
                <span>Newsletter</span>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="preferences.newsletter">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button @click="savePreferences" class="btn">Enregistrer les préférences</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService';
import { movieService } from '../services/movieService';

const router = useRouter();

// Tab management
const activeTab = ref('bookings');

// User data
const user = ref({});
const loading = ref(true);
const error = ref(null);

// Bookings data
const bookings = ref([]);
const loadingBookings = ref(false);
const bookingsError = ref(null);

// Settings forms
const userForm = ref({
  name: '',
  email: ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const preferences = ref({
  emailNotifications: true,
  sessionReminders: true,
  newsletter: false
});

// Computed properties
const userInitials = computed(() => {
  if (!user.value.name) return '';
  return user.value.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();
});

// Methods
async function fetchUserData() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await authService.getCurrentUser();
    user.value = response.data;
    
    // Initialize form with user data
    userForm.value = {
      name: user.value.name,
      email: user.value.email
    };
    
    await fetchUserBookings();
  } catch (err) {
    error.value = "Impossible de charger les données du profil. Veuillez réessayer.";
    console.error('Error fetching user data:', err);
  } finally {
    loading.value = false;
  }
}

async function fetchUserBookings() {
  loadingBookings.value = true;
  bookingsError.value = null;
  
  try {
    const response = await movieService.getUserBookings();
    bookings.value = response.data;
  } catch (err) {
    bookingsError.value = "Impossible de charger vos réservations.";
    console.error('Error fetching bookings:', err);
  } finally {
    loadingBookings.value = false;
  }
}

function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function isUpcoming(dateString) {
  return new Date(dateString) > new Date();
}

async function updateProfile() {
  // In a real app, you'd send this to your API
  alert('Profil mis à jour avec succès !');
}

async function updatePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas.');
    return;
  }
  
  // In a real app, you'd send this to your API
  alert('Mot de passe modifié avec succès !');
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
}

function savePreferences() {
  // In a real app, you'd send this to your API
  alert('Préférences enregistrées avec succès !');
}

async function handleLogout() {
  try {
    await authService.logout();
    router.push('/');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchUserData();
});
</script>

<style scoped>
.profile-page {
  padding: 30px 0;
  min-height: 80vh;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--secondary-color);
}

.profile-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

/* Profile Sidebar */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 25px;
  text-align: center;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 auto 20px;
}

.profile-name {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.profile-email {
  color: #666;
  margin-bottom: 5px;
}

.profile-member {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 25px;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-full {
  width: 100%;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-danger {
  background-color: #dc3545;
}

.profile-menu {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  width: 100%;
  text-align: left;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #eee;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item.active {
  background-color: var(--primary-color);
  color: white;
}

.menu-item i {
  margin-right: 10px;
}

/* Profile Main */
.profile-main {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.tab-content h2 {
  margin-bottom: 25px;
  color: var(--secondary-color);
  font-weight: 700;
  position: relative;
  padding-bottom: 10px;
}

.tab-content h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: var(--primary-color);
}

/* Bookings Tab */
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.booking-card {
  display: flex;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.booking-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.booking-movie-image {
  flex: 0 0 150px;
}

.booking-movie-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-info {
  flex: 1;
  padding: 20px;
  position: relative;
}

.booking-info h3 {
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.booking-date, .booking-seats, .booking-reference {
  margin-bottom: 8px;
  color: #555;
}

.booking-date i, .booking-seats i, .booking-reference i {
  width: 20px;
  text-align: center;
  margin-right: 5px;
}

.booking-status {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  background-color: #ccc;
  color: white;
}

.status-upcoming {
  background-color: #4caf50;
}

/* Settings Tab */
.settings-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.settings-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.settings-section h3 {
  margin-bottom: 20px;
  color: var(--text-color);
}

.settings-form {
  max-width: 500px;
}

.settings-options {
  max-width: 500px;
}

.setting-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.setting-toggle:last-child {
  border-bottom: none;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-icon {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: var(--text-color);
}

.empty-state p {
  margin-bottom: 20px;
  color: #666;
}

/* Loading and Error States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  color: var(--primary-color);
  padding: 30px;
  margin-bottom: 20px;
}

.btn-retry {
  margin-top: 15px;
}

/* Form Actions */
.form-actions {
  margin-top: 20px;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .profile-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .profile-card {
    flex: 1;
    min-width: 300px;
  }
  
  .profile-menu {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    min-width: 300px;
  }
  
  .menu-item {
    flex: 1 0 auto;
    border-bottom: none;
    border-right: 1px solid #eee;
    justify-content: center;
  }
  
  .menu-item:last-child {
    border-right: none;
  }
}

@media (max-width: 768px) {
  .profile-sidebar {
    flex-direction: column;
  }
  
  .profile-menu {
    flex-direction: column;
  }
  
  .menu-item {
    border-right: none;
    border-bottom: 1px solid #eee;
    justify-content: flex-start;
  }
  
  .booking-card {
    flex-direction: column;
  }
  
  .booking-movie-image {
    flex: 0 0 auto;
    height: 200px;
  }
  
  .booking-status {
    position: static;
    display: inline-block;
    margin-top: 10px;
  }
}
</style>