<template>
  <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full transform hover:-translate-y-1 transition-transform">
    <router-link :to="`/movie/${movie.id}`" class="block h-full">
      <div class="relative pb-[150%]"> <!-- 2:3 aspect ratio -->
        <img 
          :src="movie.poster_url || placeholderImage" 
          :alt="movie.title"
          @error="handleImageError"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <span class="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
          {{ movie.rating || '?' }} ★
        </span>
      </div>
      
      <div class="p-4">
        <h3 class="font-semibold text-gray-800 truncate">{{ movie.title }}</h3>
        <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{{ movie.duration || '?' }} min</span>
          <span v-if="movie.category" class="bg-gray-100 px-2 py-1 rounded">
            {{ movie.category.name }}
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'MovieCard',
  props: {
    movie: {
      type: Object,
      required: true
    }
  },
  setup() {
    const placeholderImage = ref('/images/movie-placeholder.jpg');
    
    const handleImageError = (e) => {
      e.target.src = placeholderImage.value;
    };
    
    return {
      placeholderImage,
      handleImageError
    };
  }
};
</script>