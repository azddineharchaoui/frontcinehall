<template>
  <div class="booking-container">
    <h2 class="booking-title">Réservation pour "{{ showtime?.movie?.title || 'Film' }}"</h2>
    <div class="booking-details">
      <p v-if="showtime">
        <strong>Séance :</strong> {{ formatDate(showtime.date) }} à {{ showtime.time }} - Salle {{ showtime.room }}
      </p>
      
      <div class="booking-section">
        <h3>Sélectionnez vos places</h3>
        <div class="seats-info">
          <div class="seats-count">
            <label>Nombre de places :</label>
            <div class="seats-selector">
              <button 
                @click="decreaseSeats" 
                :disabled="selectedSeatsCount <= 1"
                class="seat-btn"
              >-</button>
              <span>{{ selectedSeatsCount }}</span>
              <button 
                @click="increaseSeats" 
                :disabled="selectedSeatsCount >= maxSeatsAllowed || selectedSeatsCount >= availableSeats"
                class="seat-btn"
              >+</button>
            </div>
          </div>
          <div class="seats-total">
            <div>Prix unitaire: {{ formatPrice(showtime?.price || 0) }}</div>
            <div class="price-total">Total: {{ formatPrice((showtime?.price || 0) * selectedSeatsCount) }}</div>
          </div>
        </div>
        
        <div class="seat-selection" v-if="showSeats">
          <h4>Sélection des sièges</h4>
          <div class="screen">Écran</div>
          <div class="seating-plan">
            <div 
              v-for="(seat, index) in seats" 
              :key="`seat-${index}`"
              class="seat" 
              :class="{
                'seat-occupied': seat.occupied,
                'seat-selected': selectedSeats.includes(seat.id)
              }"
              @click="toggleSeatSelection(seat)"
            >
              {{ seat.row }}{{ seat.number }}
            </div>
          </div>
          
          <div class="seat-legend">
            <div class="legend-item">
              <div class="legend-icon seat"></div>
              <span>Disponible</span>
            </div>
            <div class="legend-item">
              <div class="legend-icon seat seat-occupied"></div>
              <span>Occupé</span>
            </div>
            <div class="legend-item">
              <div class="legend-icon seat seat-selected"></div>
              <span>Sélectionné</span>
            </div>
          </div>
        </div>
        
        <div class="payment-info" v-if="step === 2">
          <h3>Informations de paiement</h3>
          <div class="form-group">
            <label for="cardName">Nom sur la carte</label>
            <input type="text" id="cardName" v-model="paymentInfo.cardName" placeholder="John Doe">
          </div>
          
          <div class="form-group">
            <label for="cardNumber">Numéro de carte</label>
            <input type="text" id="cardNumber" v-model="paymentInfo.cardNumber" placeholder="1234 5678 9012 3456">
          </div>
          
          <div class="payment-row">
            <div class="form-group">
              <label for="cardExpiry">Date d'expiration</label>
              <input type="text" id="cardExpiry" v-model="paymentInfo.cardExpiry" placeholder="MM/YY">
            </div>
            
            <div class="form-group">
              <label for="cardCvc">CVC</label>
              <input type="text" id="cardCvc" v-model="paymentInfo.cardCvc" placeholder="123">
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="booking-actions">
      <button 
        v-if="step === 1" 
        @click="goToPayment" 
        class="btn" 
        :disabled="selectedSeats.length !== selectedSeatsCount"
      >
        Continuer vers le paiement
      </button>
      
      <button 
        v-if="step === 2" 
        @click="completeBooking" 
        class="btn"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Traitement...' : 'Confirmer la réservation' }}
      </button>
      
      <button 
        v-if="step === 2" 
        @click="step = 1" 
        class="btn btn-outline"
        :disabled="isSubmitting"
      >
        Retour
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="bookingComplete" class="booking-success">
      <h3>Réservation confirmée !</h3>
      <p>Votre réservation a été effectuée avec succès. Un e-mail de confirmation a été envoyé à votre adresse.</p>
      <p>Numéro de réservation: <strong>{{ bookingReference }}</strong></p>
      <div class="success-actions">
        <router-link to="/profil" class="btn">Voir mes réservations</router-link>
        <router-link to="/" class="btn btn-outline">Retour à l'accueil</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { movieService } from '../services/movieService'

const route = useRoute()
const router = useRouter()
const showtimeId = route.params.id

// State
const showtime = ref(null)
const seats = ref([])
const selectedSeats = ref([])
const selectedSeatsCount = ref(1)
const maxSeatsAllowed = 8
const step = ref(1)
const error = ref(null)
const isSubmitting = ref(false)
const bookingComplete = ref(false)
const bookingReference = ref('')

const paymentInfo = ref({
  cardName: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: ''
})

// Computed
const availableSeats = computed(() => {
  return showtime.value?.available_seats || 0
})

const showSeats = computed(() => {
  return seats.value.length > 0
})

// Methods
async function fetchShowtime() {
  try {
    const response = await apiClient.get(`/showtimes/${showtimeId}`)
    showtime.value = response.data
    generateSeats()
  } catch (err) {
    error.value = "Impossible de charger les informations de la séance."
    console.error('Error fetching showtime:', err)
  }
}

function generateSeats() {
  // This is a simplified example - in a real app, you'd get actual seat data from the API
  const totalSeats = 80 // 8 rows of 10 seats
  const occupiedSeatIndices = []
  
  // Randomly mark some seats as occupied for demo purposes
  // In a real app, this data would come from the API
  const totalOccupied = totalSeats - (showtime.value?.available_seats || 0)
  while (occupiedSeatIndices.length < totalOccupied) {
    const randomIndex = Math.floor(Math.random() * totalSeats)
    if (!occupiedSeatIndices.includes(randomIndex)) {
      occupiedSeatIndices.push(randomIndex)
    }
  }
  
  const generatedSeats = []
  for (let i = 0; i < totalSeats; i++) {
    const row = String.fromCharCode(65 + Math.floor(i / 10))
    const number = (i % 10) + 1
    generatedSeats.push({
      id: i + 1,
      row,
      number,
      occupied: occupiedSeatIndices.includes(i)
    })
  }
  
  seats.value = generatedSeats
}

function toggleSeatSelection(seat) {
  if (seat.occupied) return
  
  const index = selectedSeats.value.indexOf(seat.id)
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
  } else if (selectedSeats.value.length < selectedSeatsCount.value) {
    selectedSeats.value.push(seat.id)
  }
}

function increaseSeats() {
  if (selectedSeatsCount.value < maxSeatsAllowed && selectedSeatsCount.value < availableSeats.value) {
    selectedSeatsCount.value++
  }
}

function decreaseSeats() {
  if (selectedSeatsCount.value > 1) {
    selectedSeatsCount.value--
    if (selectedSeats.value.length > selectedSeatsCount.value) {
      selectedSeats.value = selectedSeats.value.slice(0, selectedSeatsCount.value)
    }
  }
}

function goToPayment() {
  if (selectedSeats.value.length === selectedSeatsCount.value) {
    step.value = 2
  } else {
    error.value = `Veuillez sélectionner ${selectedSeatsCount.value} siège(s).`
  }
}

async function completeBooking() {
  isSubmitting.value = true
  error.value = null
  
  try {
    // Validate payment info (simple validation for demo)
    if (!paymentInfo.value.cardName || !paymentInfo.value.cardNumber || 
        !paymentInfo.value.cardExpiry || !paymentInfo.value.cardCvc) {
      error.value = "Veuillez remplir tous les champs de paiement."
      isSubmitting.value = false
      return
    }
    
    const bookingData = {
      seats: selectedSeats.value,
      payment_method: 'credit_card',
      payment_details: { ...paymentInfo.value }
    }
    
    const response = await movieService.bookSeats(showtimeId, bookingData)
    bookingReference.value = response.data.reference || 'BK' + Math.floor(Math.random() * 1000000)
    bookingComplete.value = true
  } catch (err) {
    error.value = "Une erreur est survenue lors de la réservation. Veuillez réessayer."
    console.error('Error completing booking:', err)
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(dateString) {
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(price)
}

// Lifecycle hooks
onMounted(() => {
  fetchShowtime()
})
</script>

<style scoped>
.booking-container {
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
}

.booking-title {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: var(--primary-color);
}

.booking-details {
  margin-bottom: 25px;
}

.booking-section {
  margin-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.seats-info {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  margin-bottom: 25px;
  align-items: center;
}

.seats-selector {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.seats-selector span {
  margin: 0 15px;
  font-size: 1.2rem;
  min-width: 25px;
  text-align: center;
}

.seat-btn {
  width: 30px;
  height: 30px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seat-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.price-total {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-top: 5px;
}

.seat-selection {
  margin-top: 30px;
}

.screen {
  width: 80%;
  height: 20px;
  background-color: #eee;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #777;
  border-radius: 4px;
  transform: perspective(100px) rotateX(-5deg);
}

.seating-plan {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 10px;
  max-width: 500px;
  margin: 0 auto 30px;
}

.seat {
  aspect-ratio: 1;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.seat:hover:not(.seat-occupied) {
  background-color: #bbb;
}

.seat-occupied {
  background-color: #999;
  cursor: not-allowed;
  color: #777;
}

.seat-selected {
  background-color: var(--primary-color);
  color: white;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
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
  border-radius: 3px;
}

.payment-info {
  margin-top: 30px;
}

.payment-row {
  display: flex;
  gap: 20px;
}

.payment-row .form-group {
  flex: 1;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.error-message {
  color: var(--primary-color);
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
}

.booking-success {
  text-align: center;
  padding: 30px 0;
}

.booking-success h3 {
  color: green;
  margin-bottom: 15px;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .seats-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .seating-plan {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .seat-legend {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .payment-row {
    flex-direction: column;
    gap: 15px;
  }
}
</style>