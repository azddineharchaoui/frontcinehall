<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-16">
      <loading-spinner message="Chargement du film..." />
    </div>
    
    <!-- Not found State -->
    <div v-else-if="!movie" class="text-center py-16">
      <h2 class="text-2xl font-bold mb-2">Film non trouvé</h2>
      <p class="text-gray-500 mb-4">Le film que vous cherchez n'existe pas ou a été supprimé.</p>
      <router-link to="/movies" class="inline-flex items-center text-primary hover:text-primary-dark">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Retour aux films
      </router-link>
    </div>
    
    <!-- Movie Detail Content -->
    <div v-else class="movie-detail">
      <!-- Back button -->
      <router-link to="/movies" class="inline-flex items-center text-primary hover:text-primary-dark mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Retour aux films
      </router-link>
      
      <!-- Movie Header -->
      <div class="flex flex-col md:flex-row gap-8 mb-12">
        <!-- Movie Poster -->
        <div class="w-full md:w-1/3 lg:w-1/4">
          <div class="relative rounded-lg overflow-hidden shadow-lg">
            <img 
              :src="movie.poster_url || placeholderImage" 
              :alt="movie.title" 
              class="w-full h-auto"
              @error="handleImageError"
            />
          </div>
        </div>
        
        <!-- Movie Info -->
        <div class="flex-1">
          <h1 class="text-3xl lg:text-4xl font-bold mb-2">{{ movie.title }}</h1>
          
          <div class="flex flex-wrap items-center gap-4 mb-6">
            <span class="inline-flex items-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="ml-1 font-medium">{{ movie.rating || '?' }}</span>
            </span>
            
            <span class="text-gray-600">{{ movie.duration || '?' }} min</span>
            
            <span v-if="movie.category" class="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
              {{ movie.category.name }}
            </span>
          </div>
          
          <div class="prose max-w-none mb-8">
            <h3 class="text-xl font-semibold mb-2">Synopsis</h3>
            <p class="text-gray-700">{{ movie.description || 'Aucune description disponible.' }}</p>
          </div>
          
          <button 
            @click="showSessionsModal = true" 
            class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Réserver
          </button>
        </div>
      </div>
      
      <!-- Sessions Modal -->
      <div v-if="showSessionsModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-center justify-center min-h-screen p-4">
          <!-- Backdrop -->
          <div @click="showSessionsModal = false" class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          
          <!-- Modal Content -->
          <div class="relative bg-white rounded-lg max-w-xl w-full mx-auto p-6 shadow-xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold" id="modal-title">Séances disponibles</h2>
              <button @click="showSessionsModal = false" class="text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div v-if="sessionsLoading" class="py-8 flex justify-center">
              <loading-spinner message="Chargement des séances..." />
            </div>
            
            <div v-else-if="sessions.length === 0" class="py-8 text-center text-gray-500">
              <p>Aucune séance disponible pour ce film.</p>
            </div>
            
            <div v-else class="space-y-3">
              <div v-for="session in sessions" :key="session.id" class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium">{{ formatDate(session.date) }}</div>
                    <div class="text-primary">{{ formatTime(session.start_time) }}</div>
                    <div class="text-sm text-gray-500">Salle {{ session.room.name }}</div>
                    <div class="text-sm font-medium">{{ session.price }} DH</div>
                  </div>
                  <button 
                    @click="selectSession(session)" 
                    class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded transition-colors duration-300"
                  >
                    Sélectionner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Reservation Modal -->
      <div v-if="showReservationModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-center justify-center min-h-screen p-4">
          <!-- Backdrop -->
          <div @click="showReservationModal = false" class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          
          <!-- Modal Content -->
          <div class="relative bg-white rounded-lg max-w-lg w-full mx-auto p-6 shadow-xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold" id="modal-title">Réservation</h2>
              <button @click="showReservationModal = false" class="text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <p><span class="font-medium">Film:</span> {{ movie.title }}</p>
              <p><span class="font-medium">Date:</span> {{ selectedSession ? formatDate(selectedSession.date) : '' }}</p>
              <p><span class="font-medium">Heure:</span> {{ selectedSession ? formatTime(selectedSession.start_time) : '' }}</p>
              <p><span class="font-medium">Salle:</span> {{ selectedSession?.room.name || '' }}</p>
              <p><span class="font-medium">Prix:</span> {{ selectedSession?.price || '0' }} DH</p>
            </div>
            
            <form @submit.prevent="makeReservation" class="space-y-4">
              <div>
                <label for="seats" class="block text-sm font-medium text-gray-700 mb-1">Nombre de places:</label>
                <select 
                  id="seats" 
                  v-model="reservation.seats" 
                  class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                >
                  <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              
              <div class="font-medium text-xl text-right">
                Total: {{ totalPrice }} DH
              </div>
              
              <div class="flex justify-end space-x-3">
                <button 
                  type="button" 
                  @click="showReservationModal = false"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  :disabled="reservationInProgress"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <span v-if="reservationInProgress">Réservation en cours...</span>
                  <span v-else>Confirmer la réservation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Success Modal -->
      <div v-if="showSuccessModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-center justify-center min-h-screen p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          
          <!-- Modal Content -->
          <div class="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl text-center">
            <div class="mb-4">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold mt-4" id="modal-title">Réservation confirmée</h2>
            </div>
            
            <p class="mb-6">Votre réservation a été confirmée avec succès!</p>
            <p class="mb-6 text-gray-600">Un email de confirmation a été envoyé à votre adresse.</p>
            
            <button 
              @click="showSuccessModal = false"
              class="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-success hover:bg-success-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'MovieDetail',
  components: {
    LoadingSpinner
  },
  
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();
    
    const loading = ref(false);
    const sessionsLoading = ref(false);
    const placeholderImage = ref('/images/movie-placeholder.jpg');
    
    const showSessionsModal = ref(false);
    const showReservationModal = ref(false);
    const showSuccessModal = ref(false);
    
    const selectedSession = ref(null);
    const reservationInProgress = ref(false);
    
    const reservation = ref({
      session_id: null,
      seats: 1
    });
    
    const movie = computed(() => store.getters['movies/getCurrentMovie']);
    const sessions = computed(() => store.getters['sessions/getSessionsByMovie'](parseInt(route.params.id)) || []);
    
    const totalPrice = computed(() => {
      if (!selectedSession.value) return 0;
      return selectedSession.value.price * reservation.value.seats;
    });
    
    const handleImageError = (e) => {
      e.target.src = placeholderImage.value;
    };
    
    const loadMovieData = async () => {
      loading.value = true;
      try {
        const movieId = parseInt(route.params.id);
        await store.dispatch('movies/fetchMovie', movieId);
        await loadSessionsData();
      } catch (error) {
        console.error('Failed to load movie data', error);
        toast.error('Impossible de charger les détails du film.');
      } finally {
        loading.value = false;
      }
    };
    
    const loadSessionsData = async () => {
      sessionsLoading.value = true;
      try {
        const movieId = parseInt(route.params.id);
        await store.dispatch('sessions/fetchSessionsByMovie', movieId);
      } catch (error) {
        console.error('Failed to load sessions', error);
        toast.error('Impossible de charger les séances disponibles.');
      } finally {
        sessionsLoading.value = false;
      }
    };
    
    const selectSession = (session) => {
      selectedSession.value = session;
      reservation.value.session_id = session.id;
      showSessionsModal.value = false;
      showReservationModal.value = true;
    };
    
    const makeReservation = async () => {
      if (!store.getters['auth/isAuthenticated']) {
        // Redirect to login if not authenticated
        router.push({ path: '/login', query: { redirect: route.fullPath } });
        return;
      }
      
      reservationInProgress.value = true;
      try {
        await store.dispatch('reservations/createReservation', {
          session_id: reservation.value.session_id,
          number_of_seats: reservation.value.seats
        });
        
        // Show success modal
        showReservationModal.value = false;
        showSuccessModal.value = true;
      } catch (error) {
        console.error('Reservation failed', error);
        toast.error('La réservation a échoué. Veuillez réessayer.');
      } finally {
        reservationInProgress.value = false;
      }
    };
    
    const formatDate = (dateString) => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    };
    
    const formatTime = (timeString) => {
      return timeString.substring(0, 5); // Get HH:MM from HH:MM:SS
    };
    
    onMounted(loadMovieData);
    
    return {
      loading,
      sessionsLoading,
      movie,
      sessions,
      showSessionsModal,
      showReservationModal,
      showSuccessModal,
      selectedSession,
      reservation,
      reservationInProgress,
      totalPrice,
      placeholderImage,
      handleImageError,
      loadMovieData,
      selectSession,
      makeReservation,
      formatDate,
      formatTime
    };
  }
};
</script>