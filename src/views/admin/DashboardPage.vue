<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1>Tableau de bord</h1>
    </div>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-film"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalMovies || 0 }}</div>
          <div class="stat-title">Films</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-door-open"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalTheaters || 0 }}</div>
          <div class="stat-title">Salles</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalSessions || 0 }}</div>
          <div class="stat-title">Séances</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
          <div class="stat-title">Utilisateurs</div>
        </div>
      </div>
    </div>
    
    <div class="dashboard-charts">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Revenu par film (top 5)</h3>
        </div>
        <div class="chart-container">
          <div v-if="loading" class="loading-indicator">Chargement...</div>
          <div v-else-if="moviesRevenue.length === 0" class="no-data">Pas de données disponibles</div>
          <div v-else class="revenue-chart">
            <div 
              v-for="movie in moviesRevenue" 
              :key="movie.id" 
              class="revenue-bar-container"
            >
              <div class="revenue-label">{{ movie.title }}</div>
              <div class="revenue-bar-wrapper">
                <div 
                  class="revenue-bar" 
                  :style="{ width: calculateBarWidth(movie.revenue) }"
                >
                  {{ formatPrice(movie.revenue) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chart-card">
        <div class="chart-header">
          <h3>Taux d'occupation des séances</h3>
        </div>
        <div class="chart-container">
          <div v-if="loading" class="loading-indicator">Chargement...</div>
          <div v-else-if="sessionsOccupancy.length === 0" class="no-data">Pas de données disponibles</div>
          <div v-else class="occupancy-chart">
            <div 
              v-for="session in sessionsOccupancy" 
              :key="session.id" 
              class="occupancy-item"
            >
              <div class="occupancy-details">
                <div class="occupancy-title">
                  {{ session.movie_title }} - {{ formatDateTime(session.date, session.time) }}
                </div>
                <div class="occupancy-info">
                  Salle {{ session.room }} - {{ session.occupied_seats }}/{{ session.total_seats }} places
                </div>
              </div>
              <div class="occupancy-progress">
                <div 
                  class="occupancy-bar"
                  :style="{ width: calculateOccupancy(session.occupied_seats, session.total_seats) }"
                  :class="{ 
                    'high': getOccupancyRate(session.occupied_seats, session.total_seats) > 80,
                    'medium': getOccupancyRate(session.occupied_seats, session.total_seats) > 50 && 
                              getOccupancyRate(session.occupied_seats, session.total_seats) <= 80,
                    'low': getOccupancyRate(session.occupied_seats, session.total_seats) <= 50
                  }"
                >
                  {{ getOccupancyRate(session.occupied_seats, session.total_seats) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { adminService } from '../../services/adminService'

// État
const loading = ref(true)
const stats = ref({})
const moviesRevenue = ref([])
const sessionsOccupancy = ref([])

// Fonctions
async function fetchDashboardData() {
  try {
    const response = await adminService.getDashboardData()
    stats.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

async function fetchMoviesRevenue() {
  try {
    const response = await adminService.getMoviesRevenue()
    moviesRevenue.value = response.data.slice(0, 5) // Top 5
  } catch (error) {
    console.error('Erreur lors du chargement des revenus:', error)
  }
}

async function fetchSessionsOccupancy() {
  try {
    const response = await adminService.getSessionsOccupancy()
    sessionsOccupancy.value = response.data.slice(0, 10) // Top 10
  } catch (error) {
    console.error('Erreur lors du chargement des taux d\'occupation:', error)
  } finally {
    loading.value = false
  }
}

function calculateBarWidth(revenue) {
  if (moviesRevenue.value.length === 0) return '0%'
  
  const maxRevenue = Math.max(...moviesRevenue.value.map(movie => movie.revenue))
  const percentage = (revenue / maxRevenue) * 100
  return `${percentage}%`
}

function calculateOccupancy(occupied, total) {
  if (!total) return '0%'
  return `${Math.round((occupied / total) * 100)}%`
}

function getOccupancyRate(occupied, total) {
  if (!total) return 0
  return Math.round((occupied / total) * 100)
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

function formatDateTime(date, time) {
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
  return `${formattedDate} ${time}`
}

// Cycle de vie
onMounted(async () => {
  await fetchDashboardData()
  await fetchMoviesRevenue()
  await fetchSessionsOccupancy()
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--secondary-color);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(229, 9, 20, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-right: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--secondary-color);
}

.stat-title {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.dashboard-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
}

.chart-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--secondary-color);
}

.loading-indicator, .no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-style: italic;
}

.revenue-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.revenue-bar-container {
  display: flex;
  align-items: center;
}

.revenue-label {
  flex: 0 0 150px;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.revenue-bar-wrapper {
  flex: 1;
  height: 30px;
  background-color: #f1f1f1;
  border-radius: 4px;
  overflow: hidden;
}

.revenue-bar {
  height: 100%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: width 1s;
}

.occupancy-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.occupancy-item {
  margin-bottom: 15px;
}

.occupancy-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.occupancy-info {
  color: #666;
}

.occupancy-progress {
  height: 20px;
  background-color: #f1f1f1;
  border-radius: 4px;
  overflow: hidden;
}

.occupancy-bar {
  height: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  font-size: 0.8rem;
  transition: width 1s;
}

.occupancy-bar.high {
  background-color: #4caf50;
}

.occupancy-bar.medium {
  background-color: #ff9800;
}

.occupancy-bar.low {
  background-color: #f44336;
}

@media (max-width: 768px) {
  .dashboard-charts {
    grid-template-columns: 1fr;
  }
}
</style>