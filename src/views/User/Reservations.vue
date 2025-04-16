<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Mes réservations</h1>
    
    <div v-if="loading" class="flex justify-center py-16">
      <loading-spinner message="Chargement des réservations..." />
    </div>
    
    <div v-else-if="reservations.length === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
      <h2 class="text-xl font-semibold mb-2">Aucune réservation trouvée</h2>
      <p class="text-gray-600 mb-6">Vous n'avez pas encore fait de réservation.</p>
      <router-link to="/movies" class="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded inline-block transition-colors duration-300">
        Explorer les films
      </router-link>
    </div>
    
    <div v-else class="space-y-6">
      <div 
        v-for="reservation in sortedReservations" 
        :key="reservation.id" 
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <!-- Reservation Status Indicator -->
        <div :class="[
          'px-4 py-2 text-white font-medium text-sm',
          {
            'bg-green-500': reservation.status === 'confirmed',
            'bg-red-500': reservation.status === 'cancelled',
            'bg-yellow-500': reservation.status === 'pending',
            'bg-gray-500': reservation.status === 'completed'
          }
        ]">
          {{ getStatusLabel(reservation.status) }}
        </div>
        
        <!-- Reservation Content -->
        <div class="p-6">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Movie Poster -->
            <div class="w-full md:w-1/4 lg:w-1/5">
              <div v-if="reservation.session && reservation.session.movie" class="relative rounded overflow-hidden">
                <img 
                  :src="reservation.session.movie.poster_url || placeholderImage" 
                  :alt="reservation.session.movie.title" 
                  class="w-full h-auto"
                  @error="handleImageError"
                />
              </div>
              <div v-else class="bg-gray-200 rounded h-40 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            
            <!-- Reservation Details -->
            <div class="flex-1">
              <h2 class="text-xl font-bold mb-2">
                {{ reservation.session && reservation.session.movie ? reservation.session.movie.title : 'Film non disponible' }}
              </h2>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
                <div>
                  <p class="text-gray-700">
                    <span class="font-medium">Date:</span> 
                    {{ reservation.session ? formatDate(reservation.session.date) : 'N/A' }}
                  </p>
                  <p class="text-gray-700">
                    <span class="font-medium">Heure:</span>
                    {{ reservation.session ? formatTime(reservation.session.start_time) : 'N/A' }}
                  </p>
                </div>
                <div>
                  <p class="text-gray-700">
                    <span class="font-medium">Salle:</span>
                    {{ reservation.session && reservation.session.room ? reservation.session.room.name : 'N/A' }}
                  </p>
                  <p class="text-gray-700">
                    <span class="font-medium">Places:</span>
                    {{ reservation.number_of_seats }}
                  </p>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-4">
                <router-link 
                  :to="`/reservation/${reservation.id}`" 
                  class="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Détails
                </router-link>
                
                <button 
                  v-if="reservation.status === 'confirmed' && !isSessionPassed(reservation.session)"
                  @click="confirmCancelReservation(reservation)"
                  class="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-red-600 border border-red-600 px-4 py-2 rounded transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </button>
                
                <button 
                  v-if="reservation.tickets && reservation.tickets.length > 0"
                  @click="downloadTickets(reservation.id)"
                  class="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-red-600" id="modal-title">Annuler la réservation ?</h2>
            <p class="mt-2 text-gray-600">Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.</p>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showCancelModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Non, garder
            </button>
            <button 
              @click="cancelReservation" 
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
              :disabled="cancelLoading"
            >
              <span v-if="cancelLoading">Annulation...</span>
              <span v-else>Oui, annuler</span>
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
import { useToast } from '@/composables/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'UserReservations',
  components: {
    LoadingSpinner
  },
  
  setup() {
    const store = useStore();
    const toast = useToast();
    
    const loading = ref(false);
    const placeholderImage = ref('/images/movie-placeholder.jpg');
    
    // Cancel reservation
    const showCancelModal = ref(false);
    const cancelLoading = ref(false);
    const reservationToCancel = ref(null);
    
    const reservations = computed(() => store.getters['reservations/getUserReservations']);
    
    const sortedReservations = computed(() => {
      return [...reservations.value].sort((a, b) => {
        // Sort by session date (future sessions first)
        if (a.session && b.session) {
          return new Date(b.session.date) - new Date(a.session.date);
        }
        return 0;
      });
    });
    
    const loadReservations = async () => {
      loading.value = true;
      try {
        await store.dispatch('reservations/fetchUserReservations');
      } catch (error) {
        console.error('Error loading reservations:', error);
        toast.error('Impossible de charger vos réservations.');
      } finally {
        loading.value = false;
      }
    };
    
    const handleImageError = (e) => {
      e.target.src = placeholderImage.value;
    };
    
    const formatDate = (dateString) => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    };
    
    const formatTime = (timeString) => {
      return timeString.substring(0, 5); // Get HH:MM from HH:MM:SS
    };
    
    const getStatusLabel = (status) => {
      const statusLabels = {
        confirmed: 'Confirmée',
        pending: 'En attente',
        cancelled: 'Annulée',
        completed: 'Terminée'
      };
      return statusLabels[status] || status;
    };
    
    const isSessionPassed = (session) => {
      if (!session || !session.date) return true;
      
      const sessionDate = new Date(`${session.date} ${session.start_time}`);
      return sessionDate < new Date();
    };
    
    const confirmCancelReservation = (reservation) => {
      reservationToCancel.value = reservation;
      showCancelModal.value = true;
    };
    
    const cancelReservation = async () => {
      if (!reservationToCancel.value) return;
      
      cancelLoading.value = true;
      try {
        await store.dispatch('reservations/cancelReservation', reservationToCancel.value.id);
        toast.success('Réservation annulée avec succès');
        showCancelModal.value = false;
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        toast.error('Impossible d\'annuler la réservation.');
      } finally {
        cancelLoading.value = false;
      }
    };
    
    const downloadTickets = async (reservationId) => {
      try {
        await store.dispatch('reservations/fetchReservationTickets', reservationId);
        const tickets = store.getters['reservations/getReservationTickets'](reservationId);
        
        // Download each ticket
        if (tickets && tickets.length > 0) {
          for (const ticket of tickets) {
            await store.dispatch('reservations/downloadTicket', ticket.id);
          }
        } else {
          toast.error('Aucun ticket disponible pour cette réservation.');
        }
      } catch (error) {
        console.error('Error downloading tickets:', error);
        toast.error('Impossible de télécharger les tickets.');
      }
    };
    
    onMounted(() => {
      loadReservations();
    });
    
    return {
      loading,
      reservations,
      sortedReservations,
      showCancelModal,
      cancelLoading,
      placeholderImage,
      handleImageError,
      formatDate,
      formatTime,
      getStatusLabel,
      isSessionPassed,
      confirmCancelReservation,
      cancelReservation,
      downloadTickets
    };
  }
};
</script>