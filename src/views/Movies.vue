<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Films</h1>
    
    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <div class="flex-grow">
        <div class="relative">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Rechercher un film..." 
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="md:w-48">
        <select 
          v-model="selectedGenre" 
          class="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
        >
          <option value="">Tous les genres</option>
          <option 
            v-for="genre in genres" 
            :key="genre" 
            :value="genre"
          >
            {{ genre }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Movies Grid -->
    <div v-if="loading" class="flex justify-center py-16">
      <loading-spinner message="Chargement des films..." />
    </div>
    
    <div v-else-if="filteredMovies.length === 0" class="text-center py-16 text-gray-500">
      <p class="text-lg">Aucun film ne correspond à votre recherche.</p>
      <p v-if="searchQuery || selectedGenre" class="mt-2">
        <button 
          @click="clearFilters" 
          class="text-primary hover:text-primary-dark underline"
        >
          Effacer les filtres
        </button>
      </p>
    </div>
    
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <movie-card 
        v-for="movie in filteredMovies"
        :key="movie.id"
        :movie="movie"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useToast } from '@/composables/useToast';
import MovieCard from '@/components/movies/MovieCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'MoviesView',
  components: {
    MovieCard,
    LoadingSpinner
  },
  setup() {
    const store = useStore();
    const toast = useToast();
    
    const loading = ref(false);
    const searchQuery = ref('');
    const selectedGenre = ref('');
    
    const movies = computed(() => store.getters['movies/getAllMovies']);
    
    const genres = computed(() => {
      const genreSet = new Set();
      
      movies.value.forEach(movie => {
        if (movie.category && movie.category.name) {
          genreSet.add(movie.category.name);
        }
      });
      
      return Array.from(genreSet).sort();
    });
    
    const filteredMovies = computed(() => {
      let result = [...movies.value];
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(movie => 
          movie.title.toLowerCase().includes(query) ||
          (movie.description && movie.description.toLowerCase().includes(query))
        );
      }
      
      // Filter by genre
      if (selectedGenre.value) {
        result = result.filter(movie => 
          movie.category && movie.category.name === selectedGenre.value
        );
      }
      
      return result;
    });
    
    const clearFilters = () => {
      searchQuery.value = '';
      selectedGenre.value = '';
    };
    
    const loadMovies = async () => {
      if (movies.value.length > 0) return;
      
      loading.value = true;
      try {
        await store.dispatch('movies/fetchMovies');
      } catch (error) {
        console.error('Error loading movies:', error);
        toast.error('Impossible de charger les films.');
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      loadMovies();
    });
    
    return {
      loading,
      searchQuery,
      selectedGenre,
      genres,
      filteredMovies,
      clearFilters
    };
  }
};
</script>