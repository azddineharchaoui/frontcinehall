<template>
  <div class="theater-form-page">
    <div class="page-header">
      <h1>{{ isEditMode ? 'Modifier la salle' : 'Ajouter une salle' }}</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement des données...</p>
    </div>
    
    <div v-else class="content-card">
      <form @submit.prevent="saveTheater" class="theater-form">
        <div class="form-section">
          <h3>Informations de la salle</h3>
          
          <div class="form-group">
            <label for="name">Nom de la salle *</label>
            <input 
              type="text" 
              id="name" 
              v-model="theaterForm.name" 
              required
              placeholder="Ex: Salle 1"
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="type">Type de salle *</label>
              <select id="type" v-model="theaterForm.type" required>
                <option value="Normal">Normal</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="status">Statut</label>
              <select id="status" v-model="theaterForm.status">
                <option value="active">Actif</option>
                <option value="maintenance">En maintenance</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              v-model="theaterForm.description" 
              rows="3"
              placeholder="Description de la salle..."
            ></textarea>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Configuration des sièges</h3>
          
          <div class="configuration-section">
            <div class="form-row">
              <div class="form-group">
                <label for="rows">Nombre de rangées *</label>
                <input 
                  type="number" 
                  id="rows" 
                  v-model.number="seatsConfig.rows" 
                  required
                  min="1"
                  max="15"
                >
              </div>
              
              <div class="form-group">
                <label for="columns">Sièges par rangée *</label>
                <input 
                  type="number" 
                  id="columns" 
                  v-model.number="seatsConfig.columns" 
                  required
                  min="1"
                  max="20"
                >
              </div>
            </div>
            
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  id="has_couple_seats" 
                  v-model="seatsConfig.hasCoupleSeat"
                >
                <label for="has_couple_seats">Inclure des sièges couple</label>
              </div>
            </div>
            
            <div class="form-group" v-if="seatsConfig.hasCoupleSeat">
              <label for="couple_seats_percentage">Pourcentage de sièges couple</label>
              <input 
                type="range" 
                id="couple_seats_percentage" 
                v-model.number="seatsConfig.coupleSeatsPercentage"
                min="10"
                max="50"
                step="10"
              >
              <div class="range-value">{{ seatsConfig.coupleSeatsPercentage }}%</div>
            </div>
          </div>
          
          <div class="preview-section">
            <h4>Aperçu de la configuration</h4>
            
            <div class="theater-preview">
              <div class="screen-preview">Écran</div>
              <div 
                class="seats-preview"
                :style="{gridTemplateColumns: `repeat(${seatsConfig.columns}, 1fr)`}"
              >
                <div 
                  v-for="(seat, index) in previewSeats" 
                  :key="index"
                  class="seat-preview"
                  :class="{
                    'seat-couple-preview': seat.type === 'couple',
                    'seat-vip-preview': theaterForm.type === 'VIP'
                  }"
                >
                  {{ seat.label }}
                </div>
              </div>
              
              <div class="capacity-info">
                Capacité totale: <strong>{{ calculateCapacity() }} places</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn btn-outline">Annuler</button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isSubmitting"
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

const route = useRoute()
const router = useRouter()
const theaterId = route.params.id

// États
const loading = ref(false)
const isSubmitting = ref(false)
const error = ref(null)

const theaterForm = ref({
  name: '',
  type: 'Normal',
  status: 'active',
  description: ''
})

const seatsConfig = ref({
  rows: 8,
  columns: 10,
  hasCoupleSeat: false,
  coupleSeatsPercentage: 20
})

// Computed
const isEditMode = computed(() => {
  return !!theaterId
})

const previewSeats = computed(() => {
  const totalSeats = seatsConfig.value.rows * seatsConfig.value.columns
  const seats = []
  
  for (let i = 0; i < totalSeats; i++) {
    const row = String.fromCharCode(65 + Math.floor(i / seatsConfig.value.columns))
    const number = (i % seatsConfig.value.columns) + 1
    
    // Déterminer si c'est un siège couple
    let type = 'standard'
    if (seatsConfig.value.hasCoupleSeat) {
      const coupleSeatsCount = Math.floor(totalSeats * (seatsConfig.value.coupleSeatsPercentage / 100))
      
      // Algorithme simple: les derniers X% sièges sont des sièges couple
      if (i >= totalSeats - coupleSeatsCount) {
        type = 'couple'
      }
    }
    
    seats.push({
      row,
      number,
      label: `${row}${number}`,
      type
    })
  }
  
  return seats
})

// Méthodes
async function fetchTheater() {
  loading.value = true
  
  try {
    const response = await adminService.getTheater(theaterId)
    const theater = response.data
    
    // Remplir le formulaire avec les données de la salle
    theaterForm.value = {
      name: theater.name,
      type: theater.type,
      status: theater.status || 'active',
      description: theater.description || ''
    }
    
    // Charger les sièges pour la configuration
    await fetchTheaterSeats()
  } catch (err) {
    error.value = "Erreur lors du chargement de la salle."
    console.error('Error fetching theater:', err)
  } finally {
    loading.value = false
  }
}

async function fetchTheaterSeats() {
  try {
    const response = await adminService.getTheaterSeats(theaterId)
    const seats = response.data
    
    if (seats && seats.length > 0) {
      // Déterminer les rangées et colonnes
      const rows = new Set()
      const columns = new Set()
      let coupleSeats = 0
      
      seats.forEach(seat => {
        rows.add(seat.row)
        columns.add(seat.number)
        if (seat.type === 'couple') {
          coupleSeats++
        }
      })
      
      seatsConfig.value.rows = rows.size
      seatsConfig.value.columns = Math.max(...columns.values())
      seatsConfig.value.hasCoupleSeat = coupleSeats > 0
      if (coupleSeats > 0) {
        seatsConfig.value.coupleSeatsPercentage = Math.round((coupleSeats / seats.length) * 100)
      }
    }
  } catch (err) {
    console.error('Error fetching theater seats:', err)
  }
}

function calculateCapacity() {
  return seatsConfig.value.rows * seatsConfig.value.columns
}

async function saveTheater() {
  isSubmitting.value = true
  error.value = null
  
  try {
    // Préparer les données pour l'API
    const theaterData = {
      ...theaterForm.value,
      seat_rows: seatsConfig.value.rows,
      seat_columns: seatsConfig.value.columns,
      has_couple_seats: seatsConfig.value.hasCoupleSeat,
      couple_seats_percentage: seatsConfig.value.hasCoupleSeat ? seatsConfig.value.coupleSeatsPercentage : 0
    }
    
    if (isEditMode.value) {
      await adminService.updateTheater(theaterId, theaterData)
    } else {
      await adminService.createTheater(theaterData)
    }
    
    // Rediriger vers la liste des salles
    router.push('/admin/salles')
  } catch (err) {
    error.value = "Erreur lors de l'enregistrement de la salle."
    console.error('Error saving theater:', err)
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push('/admin/salles')
}

// Cycle de vie
onMounted(() => {
  if (isEditMode.value) {
    fetchTheater()
  }
})

watch(() => theaterForm.value.type, (newType) => {
  // Réinitialiser certains paramètres si on change le type de salle
  if (newType === 'VIP') {
    // Les salles VIP ont généralement moins de sièges
    seatsConfig.value.rows = Math.min(seatsConfig.value.rows, 6)
    seatsConfig.value.columns = Math.min(seatsConfig.value.columns, 8)
  }
})
</script>

<style scoped>
.theater-form-page {
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

.theater-form {
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

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-group input {
  width: auto;
}

input[type="range"] {
  cursor: pointer;
}

.range-value {
  text-align: center;
  margin-top: 5px;
  font-weight: 500;
}

.configuration-section {
  margin-bottom: 30px;
}

.preview-section h4 {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
}

.theater-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.screen-preview {
  width: 70%;
  height: 20px;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #777;
  border-radius: 4px;
  transform: perspective(100px) rotateX(-5deg);
}

.seats-preview {
  display: grid;
  gap: 5px;
  width: 100%;
  max-width: 500px;
}

.seat-preview {
  aspect-ratio: 1;
  background-color: #a1c8ee;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 0.75rem;
}

.seat-couple-preview {
  background-color: #f8bbd0;
}

.seat-vip-preview {
  background-color: #ffecb3;
  border: 1px solid #ffc107;
}

.capacity-info {
  margin-top: 10px;
  font-size: 1rem;
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