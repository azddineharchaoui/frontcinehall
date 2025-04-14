<template>
  <div class="home-page">
    <!-- Hero Banner Section -->
    <section class="hero-banner">
      <div class="overlay"></div>
      <div class="container hero-content">
        <h1>Bienvenue sur CineHall</h1>
        <p>Découvrez les derniers films et réservez vos places en quelques clics</p>
        <router-link to="/films" class="btn btn-hero">Voir les films à l'affiche</router-link>
      </div>
    </section>

    <!-- Featured Movies Section -->
    <section class="container section">
      <div class="section-header">
        <h2>Films à l'affiche</h2>
        <router-link to="/films" class="see-all-link">Voir tous les films</router-link>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des films...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else class="featured-movies">
        <MovieCard v-for="movie in featuredMovies" :key="movie.id" :movie="movie" />
      </div>
    </section>

    <!-- Coming Soon Section -->
    <section class="container section">
      <div class="section-header">
        <h2>Prochainement</h2>
      </div>
      
      <div class="coming-soon-movies">
        <div v-for="movie in comingSoonMovies" :key="movie.id" class="coming-soon-movie">
          <img :src="movie.poster_url || 'https://via.placeholder.com/400x600'" :alt="movie.title">
          <div class="coming-soon-overlay">
            <h3>{{ movie.title }}</h3>
            <p class="release-date">Le {{ formatDate(movie.release_date) }}</p>
            <button class="btn btn-outline btn-reminder">Me rappeler</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Advantages Section -->
    <section class="advantages-section">
      <div class="container">
        <h2 class="text-center">Pourquoi choisir CineHall ?</h2>
        
        <div class="advantages">
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <h3>Réservation simple</h3>
            <p>Réservez vos places en quelques clics, sans attente et sans stress</p>
          </div>
          
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="fas fa-film"></i>
            </div>
            <h3>Les meilleurs films</h3>
            <p>Découvrez une sélection des meilleurs films à l'affiche</p>
          </div>
          
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="fas fa-chair"></i>
            </div>
            <h3>Choix des places</h3>
            <p>Sélectionnez vos places préférées dans la salle</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter-section">
      <div class="container">
        <h2>Ne manquez aucune sortie</h2>
        <p>Inscrivez-vous à notre newsletter et soyez informé des dernières sorties et promotions</p>
        
        <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
          <input 
            type="email" 
            v-model="newsletterEmail" 
            placeholder="Votre adresse email" 
            required
          >
          <button type="submit" class="btn">S'inscrire</button>
        </form>
        
        <p class="newsletter-message" v-if="newsletterMessage">{{ newsletterMessage }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MovieCard from '../components/MovieCard.vue';
import { movieService } from '../services/movieService';

// State
const loading = ref(true);
const error = ref(null);
const featuredMovies = ref([]);
const comingSoonMovies = ref([]);
const newsletterEmail = ref('');
const newsletterMessage = ref('');

// Methods
async function fetchFeaturedMovies() {
  try {
    const response = await movieService.getMovies({ featured: true, per_page: 4 });
    featuredMovies.value = response.data.data;
  } catch (err) {
    console.error('Error fetching featured movies:', err);
    error.value = 'Impossible de charger les films à l\'affiche.';
  } finally {
    loading.value = false;
  }
}

async function fetchComingSoonMovies() {
  try {
    // In a real app, you'd have a specific endpoint for coming soon movies
    const mockComingSoonMovies = [
      {
        id: 101,
        title: 'Le Nouveau Monde',
        poster_url: 'https://via.placeholder.com/400x600?text=Le+Nouveau+Monde',
        release_date: '2025-05-15'
      },
      {
        id: 102,
        title: 'Odyssée Spatiale',
        poster_url: 'https://via.placeholder.com/400x600?text=Odyssée+Spatiale',
        release_date: '2025-06-02'
      },
      {
        id: 103,
        title: 'Les Héritiers',
        poster_url: 'https://via.placeholder.com/400x600?text=Les+Héritiers',
        release_date: '2025-06-22'
      }
    ];
    
    comingSoonMovies.value = mockComingSoonMovies;
  } catch (err) {
    console.error('Error fetching coming soon movies:', err);
  }
}

function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function subscribeNewsletter() {
  // In a real app, you'd send this to your API
  newsletterMessage.value = 'Merci ! Vous êtes maintenant inscrit à notre newsletter.';
  newsletterEmail.value = '';
  setTimeout(() => {
    newsletterMessage.value = '';
  }, 3000);
}

// Lifecycle hooks
onMounted(async () => {
  await fetchFeaturedMovies();
  await fetchComingSoonMovies();
});
</script>

<style scoped>
.home-page {
  margin-top: -20px;
}

/* Hero Banner */
.hero-banner {
  position: relative;
  height: 600px;
  background-image: url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  margin-bottom: 50px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4));
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.hero-content p {
  font-size: 1.4rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.btn-hero {
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-hero:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
}

/* Sections */
.section {
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 10px;
}

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
}

.see-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.see-all-link:hover {
  color: #c4080f;
}

/* Featured Movies */
.featured-movies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

/* Coming Soon */
.coming-soon-movies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.coming-soon-movie {
  position: relative;
  height: 450px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.coming-soon-movie:hover {
  transform: translateY(-10px);
}

.coming-soon-movie img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coming-soon-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 30px 20px 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
  color: white;
}

.coming-soon-overlay h3 {
  margin-bottom: 5px;
  font-size: 1.4rem;
}

.release-date {
  margin-bottom: 15px;
  opacity: 0.8;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid white;
  color: white;
}

.btn-outline:hover {
  background-color: white;
  color: var(--secondary-color);
}

.btn-reminder {
  padding: 8px 16px;
  font-size: 0.9rem;
}

/* Advantages */
.advantages-section {
  padding: 70px 0;
  background-color: #f8f9fa;
}

.text-center {
  text-align: center;
  margin-bottom: 40px;
}

.advantages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.advantage-card {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s;
}

.advantage-card:hover {
  transform: translateY(-10px);
}

.advantage-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(229, 9, 20, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--primary-color);
}

.advantage-icon i {
  font-size: 30px;
}

.advantage-card h3 {
  margin-bottom: 15px;
}

/* Newsletter */
.newsletter-section {
  padding: 60px 0;
  text-align: center;
  background-color: var(--secondary-color);
  color: white;
}

.newsletter-section h2 {
  margin-bottom: 15px;
  font-size: 2rem;
}

.newsletter-section p {
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.9;
}

.newsletter-form {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
}

.newsletter-form input {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 30px 0 0 30px;
  font-size: 1rem;
}

.newsletter-form .btn {
  border-radius: 0 30px 30px 0;
}

.newsletter-message {
  margin-top: 20px;
  font-weight: 500;
  color: #4caf50;
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
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-banner {
    height: 450px;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content p {
    font-size: 1.1rem;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
  
  .newsletter-form input {
    border-radius: 30px;
    margin-bottom: 15px;
  }
  
  .newsletter-form .btn {
    border-radius: 30px;
    width: 100%;
  }
}
</style>