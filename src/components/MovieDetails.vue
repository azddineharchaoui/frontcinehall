<template>
  <div class="movie-details-container" v-if="movie">
    <div class="movie-backdrop" :style="{ backgroundImage: `url(${movie.backdrop_url || movie.poster_url})` }"></div>
    
    <div class="movie-content">
      <div class="movie-poster">
        <img :src="movie.poster_url || 'https://via.placeholder.com/300x450'" :alt="movie.title">
      </div>
      
      <div class="movie-info">
        <h1>{{ movie.title }}</h1>
        <div class="movie-meta">
          <span class="movie-year">{{ new Date(movie.release_date).getFullYear() }}</span>
          <span class="separator">•</span>
          <span class="movie-duration">{{ movie.duration }} min</span>
          <span class="separator">•</span>
          <span class="movie-genre">{{ movie.genre }}</span>
        </div>
        
        <div class="movie-rating">
          <span class="rating-value">{{ movie.rating }}/10</span>
        </div>
        
        <p class="movie-description">{{ movie.description }}</p>
        
        <div class="movie-cast" v-if="movie.cast && movie.cast.length">
          <h3>Casting</h3>
          <p>{{ movie.cast.join(', ') }}</p>
        </div>
        
        <div class="movie-director" v-if="movie.director">
          <h3>Réalisateur</h3>
          <p>{{ movie.director }}</p>
        </div>
        
        <div class="showtimes-section">
          <h3>Séances disponibles</h3>
          <div v-if="loading" class="loading-showtimes">
            Chargement des séances...
          </div>
          <div v-else-if="showtimes.length === 0" class="no-showtimes">
            Aucune séance disponible pour ce film.
          </div>
          <div v-else class="showtimes-list">
            <div 
              v-for="showtime in showtimes" 
              :key="showtime.id" 
              class="showtime-item"
              :class="{ 'almost-full': showtime.available_seats < 10 }"
            >
              <div class="showtime-details">
                <div class="showtime-date">{{ formatDate(showtime.date) }}</div>
                <div class="showtime-time">{{ showtime.time }}</div>
                <div class="showtime-room">Salle {{ showtime.room }}</div>
              </div>
              <div class="showtime-seats">
                {{ showtime.available_seats }} places disponibles
              </div>
              <router-link 
                :to="`/reservation/${showtime.id}`" 
                class="btn book-btn"
                :disabled="showtime.available_seats === 0"
              >
                {{ showtime.available_seats > 0 ? 'Réserver' : 'Complet' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else-if="loading" class="loading-container">
    Chargement du film...
  </div>
  
  <div v-else-if="error" class="error-container">
    <p>{{ error }}</p>
    <router-link to="/films" class="btn">Retour aux films</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { movieService } from '../services/movieService'

const route = useRoute()
const movieId = ref(route.params.id)
const movie = ref(null)
const showtimes = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  await fetchMovieDetails()
  await fetchShowtimes()
})

async function fetchMovieDetails() {
  loading.value = true
  error.value = null
  
  try {
    const response = await movieService.getMovie(movieId.value)
    movie.value = response.data
  } catch (err) {
    error.value = "Ce film n'existe pas ou n'est plus disponible."
    console.error('Error fetching movie details:', err)
  } finally {
    loading.value = false
  }
}

async function fetchShowtimes() {
  loading.value = true
  
  try {
    const response = await movieService.getShowtimes(movieId.value)
    showtimes.value = response.data
  } catch (err) {
    console.error('Error fetching showtimes:', err)
    showtimes.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}
</script>

<style scoped>
.movie-details-container {
  position: relative;
  margin: -20px;
}

.movie-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  filter: brightness(0.3);
  z-index: -1;
}

.movie-content {
  display: flex;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 30px;
}

.movie-poster {
  flex: 0 0 300px;
}

.movie-poster img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.movie-info {
  flex: 1;
  color: white;
  padding-top: 20px;
}

.movie-info h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.movie-meta {
  font-size: 1rem;
  margin-bottom: 15px;
}

.separator {
  margin: 0 8px;
}

.movie-rating {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.rating-value {
  font-weight: bold;
}

.movie-description {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 20px;
  color: #ddd;
}

.movie-cast, .movie-director {
  margin-bottom: 20px;
}

.movie-cast h3, .movie-director h3 {
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.showtimes-section {
  margin-top: 40px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  color: var(--text-color);
}

.showtimes-section h3 {
  margin-bottom: 15px;
}

.showtimes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.showtime-item {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.showtime-details {
  margin-bottom: 10px;
}

.showtime-date {
  font-weight: bold;
  text-transform: capitalize;
}

.showtime-time {
  font-size: 1.2rem;
  color: var(--primary-color);
  font-weight: bold;
}

.showtime-seats {
  margin: 5px 0 15px;
  font-size: 0.9rem;
}

.almost-full .showtime-seats {
  color: orange;
  font-weight: bold;
}

.book-btn {
  margin-top: auto;
}

.book-btn[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  text-align: center;
}

.error-container .btn {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .movie-content {
    flex-direction: column;
    padding: 20px;
  }
  
  .movie-poster {
    flex: 0 0 auto;
    max-width: 220px;
    margin: 0 auto;
  }
  
  .movie-info h1 {
    font-size: 1.8rem;
  }
  
  .showtimes-list {
    grid-template-columns: 1fr;
  }
}
</style>