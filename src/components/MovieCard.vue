<template>
  <div class="movie-card">
    <div class="movie-poster">
      <img :src="movie.poster_url || 'https://via.placeholder.com/300x450'" :alt="movie.title">
      <div class="movie-rating">{{ movie.rating }}/10</div>
    </div>
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title }}</h3>
      <p class="movie-details">
        <span>{{ movie.duration }} min</span>
        <span class="separator">|</span>
        <span>{{ movie.genre }}</span>
      </p>
      <router-link :to="`/films/${movie.id}`" class="btn">Voir détails</router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  movie: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.movie-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.movie-rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 5px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.movie-info {
  padding: 15px;
}

.movie-title {
  font-size: 1.2rem;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-details {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.separator {
  margin: 0 5px;
}

.movie-card .btn {
  width: 100%;
  text-align: center;
}
</style>