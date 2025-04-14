<template>
  <div class="booking-page container">
    <div class="page-header">
      <router-link to="javascript:history.back()" class="back-link">
        <i class="fas fa-arrow-left"></i> Retour
      </router-link>
      <h1>Réservation</h1>
    </div>

    <div class="booking-content">
      <Booking />
    </div>
  </div>
</template>

<script setup>
import Booking from '../components/Booking.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// If this page is accessed directly without a showtime ID, 
// redirect to the movies page
if (!route.params.id) {
  router.push('/films');
}
</script>

<style scoped>
.booking-page {
  padding-top: 20px;
}

.page-header {
  margin-bottom: 30px;
  position: relative;
}

.back-link {
  display: inline-block;
  color: var(--text-color);
  text-decoration: none;
  margin-bottom: 10px;
  font-weight: 500;
  transition: color 0.3s;
}

.back-link:hover {
  color: var(--primary-color);
}

.back-link i {
  margin-right: 5px;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--secondary-color);
}

.booking-content {
  margin-bottom: 40px;
}
</style>