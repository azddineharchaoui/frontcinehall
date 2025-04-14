<template>
  <div class="movie-detail-page">
    <MovieDetails :id="movieId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MovieDetails from '../components/MovieDetails.vue';

const route = useRoute();
const movieId = ref(route.params.id);
</script>

<style scoped>
.movie-detail-page {
  margin: -20px;
}
</style>