<template>
  <div class="movies-page container">
    <div class="page-header">
      <h1>Films à l'affiche</h1>
      <p>Découvrez tous nos films actuellement disponibles et à venir</p>
    </div>

    <div class="view-toggle">
      <button 
        @click="viewMode = 'grid'" 
        class="toggle-btn" 
        :class="{ 'active': viewMode === 'grid' }"
      >
        <i class="fas fa-th"></i> Grille
      </button>
      <button 
        @click="viewMode = 'list'" 
        class="toggle-btn" 
        :class="{ 'active': viewMode === 'list' }"
      >
        <i class="fas fa-list"></i> Liste
      </button>
    </div>

    <!-- Use MovieList component for the functionality -->
    <MovieList />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MovieList from '../components/MovieList.vue';

const viewMode = ref('grid');
</script>

<style scoped>
.movies-page {
  padding-top: 20px;
  min-height: 80vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--secondary-color);
}

.page-header p {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.view-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.toggle-btn {
  background-color: #f5f5f5;
  border: none;
  padding: 8px 16px;
  margin-left: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-btn.active {
  background-color: var(--secondary-color);
  color: white;
}

.toggle-btn i {
  margin-right: 5px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
}
</style>