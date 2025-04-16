<template>
  <div class="flex flex-col min-h-screen">
    <the-header />
    
    <main class="flex-grow">
      <transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <router-view></router-view>
      </transition>
    </main>
    
    <the-footer />
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import TheHeader from './components/layout/TheHeader.vue';
import TheFooter from './components/layout/TheFooter.vue';

export default {
  name: 'App',
  components: {
    TheHeader,
    TheFooter
  },
  setup() {
    const store = useStore();
    
    onMounted(async () => {
      // Try to get user profile if token exists
      if (store.getters['auth/isAuthenticated']) {
        try {
          await store.dispatch('auth/getProfile');
        } catch (error) {
          // Token probably expired, logout silently
          store.dispatch('auth/logout');
        }
      }
    });
  }
};
</script>