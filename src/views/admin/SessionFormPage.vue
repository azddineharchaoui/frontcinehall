<template>
  <div class="session-form-page">
    <div class="page-header">
      <h1>{{ isEditMode ? 'Modifier la séance' : 'Ajouter une séance' }}</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement des données...</p>
    </div>
    
    <div v-else class="content-card">
      <form @submit.prevent="saveSession" class="session-form">
        <div class="form-section">
          <h3>Informations générales</h3>
          
          <div class="form-group">
            <label for="movie">Film *</label>
            <select id="movie" v-model="sessionForm.movie_id" required>
              <option value="" disabled>Sélectionnez un film</option>
              <option v-for="movie in movies" :key="movie.id" :value="movie.id">
                {{ movie.title }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="theater">Salle *</label>
            <select 
              id="theater" 
              v-model="sessionForm.theater_id" 
              required
              @change="handleTheaterChange"
            >
              <option value="" disabled>Sélectionnez une salle</option>
              <option v-for="theater in theaters" :key="theater.id" :value="theater.id">
                {{ theater.name }} ({{ theater.type }})
              </option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="date">Date *</label>
              <input 
                type="date" 
                id="date" 
                v-model="sessionForm.date" 
                required
                :min="minDate"
              >
            </div>
            
            <div class="form-group">
              <label for="time">Heure *</label>
              <input 
                type="time" 
                id="time" 
                v-model="sessionForm.time" 
                required
              >
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Détails de la séance</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="language">Langue</label>
              <select id="language" v-model="sessionForm.language">
                <option value="Français">Français</option>
                <option value="Français (VOST)">Français (VOST)</option>
                <option value="Version originale (VOST)">Version originale (VOST)</option>
                <option value="Version originale">Version originale</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="price">Prix (€) *</label>
              <input 
                type="number" 
                id="price" 
                v-model.number="sessionForm.price" 
                step="0.5"
                min="0"
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Notes additionnelles</label>
            <textarea 
              id="description" 
              v-model="sessionForm.description" 
              rows="3"
              placeholder="Informations supplémentaires sur la séance..."
            ></textarea>
          </div>
        </div>
        
        <div class="form-section" v-if="selectedTheater">
          <h3>Vérification de disponibilité</h3>
          
          <div class="availability-check">
            <p>
              <strong>Salle:</strong> {{ selectedTheater.name }}
              <br>
              <strong>Type:</strong> {{ selectedTheater.type }}
              <br>
              <strong>Capacité:</strong> {{ selectedTheater.capacity }} places
            </p>
            
            <div v-if="conflictingSessions.length > 0" class="conflicts-warning">
              <h4>⚠️ Conflits détectés!</h4>
              <p>Les séances suivantes sont programmées dans la même salle à des horaires qui pourraient entrer en conflit:</p>
              <ul>
                <li v-for="(session, index) in conflictingSessions" :key="index">
                  <strong>{{ session.movie?.title || 'Film' }}</strong> - 
                  {{ formatDate(session.date) }} à {{ session.time }} 
                  (durée: environ {{ session.movie?.duration || '?' }} min)
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn btn-outline">Annuler</button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isSubmitting || conflictingSessions.length > 0"
          >
            <span v-if="isSubmitting">Enregistrement...</span>
            <span v-else>{{ isEditMode ? 'Mettre à jour' : 'Ajouter' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminService } from '../../services/adminService'
import { movieService } from '../../services/movieService'

const route = useRoute()
const router = useRouter()
const sessionId = route.params.id

// États
const loading = ref(true)
const isSubmitting = ref(false)
const error = ref(null)
const movies = ref([])
const theaters = ref([])
const sessions = ref([])
const selectedTheater = ref(null)
const conflictingSessions = ref([])

const sessionForm = ref({
  movie_id: '',
  theater_id: '',
  date: '',
  time: '',
  language: 'Français',
  price: 9.50,
  description: ''
})

// Computed
const isEditMode = computed(() => {
  return !!sessionId
})

const minDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Méthodes
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

async function fetchSession() {
  try {
    const response = await movieService.getSession(sessionId)
    const session = response.data
    
    sessionForm.value = {
      movie_id: session.movie_id || session.movie?.id,
      theater_id: session.theater_id || session.theater?.id,
      date: session.date,
      time: session.time,
      language: session.language || 'Français',
      price: session.price,
      description: session.description || ''
    }
    
    if (sessionForm.value.theater_id) {
      handleTheaterChange()
    }
  } catch (err) {
    error.value = "Erreur lors du chargement de la séance."
    console.error('Error fetching session:', err)
  }
}

async function fetchAllSessions() {
  try {
    const response = await movieService.getAllSessions()
    sessions.value = response.data.data || response.data
  } catch (err) {
    console.error('Error fetching all sessions:', err)
  }
}

function handleTheaterChange() {
  const theaterId = sessionForm.value.theater_id
  if (!theaterId) return
  
  selectedTheater.value = theaters.value.find(t => t.id === parseInt(theaterId))
  checkForConflicts()
}

function checkForConflicts() {
  if (!sessionForm.value.date || !sessionForm.value.time || !sessionForm.value.theater_id || !sessionForm.value.movie_id) {
    conflictingSessions.value = []
    return
  }
  
  const selectedTime = sessionForm.value.time
  const selectedDate = sessionForm.value.date
  const selectedTheaterId = parseInt(sessionForm.value.theater_id)
  const selectedMovieId = parseInt(sessionForm.value.movie_id)
  
  // Get selected movie duration
  const selectedMovie = movies.value.find(m => m.id === selectedMovieId)
  const selectedMovieDuration = selectedMovie ? selectedMovie.duration : 120 // Default 2 hours if unknown
  
  // Convert session time to minutes for easier calculation
  const [hours, minutes] = selectedTime.split(':').map(Number)
  const sessionTimeInMinutes = hours * 60 + minutes
  
  // Calculate session end time (adding movie duration + 30 min for cleaning)
  const sessionEndTimeInMinutes = sessionTimeInMinutes + selectedMovieDuration + 30
  
  // Find conflicting sessions (same theater, same date, overlapping time)
  const conflicts = sessions.value.filter(session => {
    // Skip comparison with current session in edit mode
    if (isEditMode.value && session.id === parseInt(sessionId)) return false
    
    // Check if same theater and date
    if (
      parseInt(session.theater_id) === selectedTheaterId && 
      session.date === selectedDate
    ) {
      // Calculate session time in minutes
      const [sessHours, sessMinutes] = session.time.split(':').map(Number)
      const sessTimeInMinutes = sessHours * 60 + sessMinutes
      
      // Get the movie for this session
      const sessMovie = movies.value.find(m => m.id === parseInt(session.movie_id))
      const sessMovieDuration = sessMovie ? sessMovie.duration : 120 // Default 2 hours if unknown
      
      // Calculate session end time
      const sessEndTimeInMinutes = sessTimeInMinutes + sessMovieDuration + 30
      
      // Check if there's an overlap
      return (
        (sessionTimeInMinutes >= sessTimeInMinutes && sessionTimeInMinutes < sessEndTimeInMinutes) ||
        (sessionEndTimeInMinutes > sessTimeInMinutes && sessionEndTimeInMinutes <= sessEndTimeInMinutes) ||
        (sessionTimeInMinutes <= sessTimeInMinutes && sessionEndTimeInMinutes >= sessEndTimeInMinutes)
      )
    }
    
    return false
  })
  
  conflictingSessions.value = conflicts
}

async function saveSession() {
  isSubmitting.value = true
  error.value = null
  
  try {
    if (isEditMode.value) {
      await adminService.updateSession(sessionId, sessionForm.value)
    } else {
      await adminService.createSession(sessionForm.value)
    }
    
    // Rediriger vers la liste des séances
    router.push('/admin/seances')
  } catch (err) {
    error.value = "Erreur lors de l'enregistrement de la séance."
    console.error('Error saving session:', err)
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

function goBack() {
  router.push('/admin/seances')
}

// Watches for conflict detection
watch(
  () => [
    sessionForm.value.theater_id, 
    sessionForm.value.date, 
    sessionForm.value.time,
    sessionForm.value.movie_id
  ],
  () => {
    if (sessionForm.value.theater_id) {
      checkForConflicts()
    }
  }
)

// Lifecycle hooks
onMounted(async () => {
  try {
    await fetchMoviesAndTheaters()
    await fetchAllSessions()
    
    if (isEditMode.value) {
      await fetchSession()
    } else {
      // Set default date to today
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      sessionForm.value.date = `${year}-${month}-${day}`
    }
  } catch (err) {
    console.error('Error in component initialization:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.session-form-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--secondary-color);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px;
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

.content-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.session-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  margin-bottom: 20px;
}

.form-section h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: var(--secondary-color);
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.availability-check {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.conflicts-warning {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
}

.conflicts-warning h4 {
  margin: 0 0 10px 0;
  color: #856404;
}

.conflicts-warning ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.conflicts-warning li {
  margin-bottom: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  color: var(--secondary-color);
  border: 1px solid #ddd;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>