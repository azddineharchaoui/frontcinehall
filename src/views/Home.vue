<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gray-900 text-white">
      <div class="absolute inset-0 bg-cover bg-center opacity-40" style="background-image: url('/images/cinema-hero.jpg')"></div>
      <div class="container mx-auto px-4 py-24 lg:py-32 relative z-10 text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Découvrez le cinéma comme jamais</h1>
        <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Les meilleurs films du moment avec un confort exceptionnel</p>
        <router-link to="/movies" class="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 text-lg">
          Voir les films
        </router-link>
      </div>
    </section>
    
    <!-- Popular Movies Section -->
    <section class="py-12 md:py-16 container mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl md:text-3xl font-bold">Films Populaires</h2>
        <router-link to="/movies" class="text-primary hover:text-primary-dark font-medium">
          Voir tous les films
        </router-link>
      </div>
      
      <div v-if="loading" class="flex justify-center py-12">
        <loading-spinner message="Chargement des films populaires..." />
      </div>
      
      <div v-else-if="popularMovies.length === 0" class="text-center py-12 text-gray-500">
        <p>Aucun film populaire disponible pour le moment.</p>
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 md:gap-6">
        <movie-card 
          v-for="movie in popularMovies"
          :key="movie.id"
          :movie="movie"
        />
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-12 md:py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-2xl md:text-3xl font-bold mb-3">Pourquoi choisir CineHall?</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Une expérience cinématographique inégalée</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4 mx-auto">
              <i class="fas fa-film text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-center mb-2">Films Premium</h3>
            <p class="text-gray-600 text-center">Les dernières sorties internationales et nationales disponibles dès leur lancement</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4 mx-auto">
              <i class="fas fa-couch text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-center mb-2">Salles Confortables</h3>
            <p class="text-gray-600 text-center">Des sièges ergonomiques pour un maximum de confort pendant votre séance</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4 mx-auto">
              <i class="fas fa-ticket-alt text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-center mb-2">Réservation Facile</h3>
            <p class="text-gray-600 text-center">Réservez vos places en quelques clics et évitez les files d'attente</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mb-4 mx-auto">
              <i class="fas fa-utensils text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-center mb-2">Service Snack</h3>
            <p class="text-gray-600 text-center">Une large sélection de collations et boissons pour accompagner votre film</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Newsletter Section -->
    <section class="py-12 md:py-16 bg-dark text-white">
      <div class="container mx-auto px-4 text-center max-w-xl">
        <h2 class="text-2xl md:text-3xl font-bold mb-3">Restez à jour</h2>
        <p class="mb-6 opacity-90">Inscrivez-vous à notre newsletter pour être informé des nouvelles sorties et promotions</p>
        <form @submit.prevent="subscribeNewsletter" class="flex flex-col sm:flex-row">
          <input 
            type="email" 
            v-model="email" 
            placeholder="Votre adresse email" 
            required
            class="flex-grow px-4 py-3 rounded-lg sm:rounded-r-none mb-3 sm:mb-0 text-gray-900"
          />
          <button 
            type="submit" 
            :disabled="subscriptionLoading"
            class="bg-red-600 hover:bg-red-700 px-6 py-3 font-bold rounded-lg sm:rounded-l-none transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            <span v-if="subscriptionLoading">...</span>
            <span v-else>S'inscrire</span>
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useToast } from '@/composables/useToast';
import MovieCard from '@/components/movies/MovieCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'Home',
  components: {
    MovieCard,
    LoadingSpinner
  },
  setup() {
    const store = useStore();
    const toast = useToast();
    
    const loading = ref(false);
    const subscriptionLoading = ref(false);
    const email = ref('');
    
    const popularMovies = computed(() => {
      return store.getters['movies/getPopularMovies'].slice(0, 6);
    });
    
    const loadPopularMovies = async () => {
      if (popularMovies.value.length > 0) {
        return;
      }
      
      loading.value = true;
      try {
        await store.dispatch('movies/fetchPopularMovies');
      } catch (error) {
        console.error('Error loading popular movies:', error);
        toast.error('Impossible de charger les films populaires.');
      } finally {
        loading.value = false;
      }
    };
    
    const subscribeNewsletter = () => {
      subscriptionLoading.value = true;
      
      // Simulate API call
      setTimeout(() => {
        toast.success(`Merci ! Votre adresse ${email.value} a bien été enregistrée.`);
        email.value = '';
        subscriptionLoading.value = false;
      }, 1000);
    };
    
    onMounted(() => {
      loadPopularMovies();
    });
    
    return {
      loading,
      popularMovies,
      email,
      subscriptionLoading,
      subscribeNewsletter
    };
  }
};
</script>