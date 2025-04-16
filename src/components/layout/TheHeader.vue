<template>
  <header class="sticky top-0 z-50 bg-white shadow-md">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="logo">
        <router-link to="/" class="block">
          <img src="../../assets/images/logo.png" alt="CineHall Logo" class="h-10" />
        </router-link>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="hidden md:block">
        <ul class="flex space-x-6">
          <li>
            <router-link to="/" class="font-medium text-gray-800 hover:text-primary relative pb-1" 
              :class="{ 'text-primary active-link': $route.path === '/' }">
              Accueil
            </router-link>
          </li>
          <li>
            <router-link to="/movies" class="font-medium text-gray-800 hover:text-primary relative pb-1" 
              :class="{ 'text-primary active-link': $route.path.startsWith('/movie') }">
              Films
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin" class="font-medium text-gray-800 hover:text-primary relative pb-1" 
              :class="{ 'text-primary active-link': $route.path.startsWith('/admin') }">
              Admin
            </router-link>
          </li>
        </ul>
      </nav>
      
      <!-- User Actions -->
      <div class="flex items-center">
        <template v-if="isAuthenticated">
          <div class="relative" ref="userMenu">
            <button 
              class="flex items-center space-x-1 font-medium text-gray-800"
              @click="toggleUserDropdown" 
              @blur="closeDropdown"
            >
              <span>{{ userName }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div v-show="showUserDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <router-link to="/profile" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                <i class="fas fa-user mr-2"></i> Mon profil
              </router-link>
              <router-link to="/reservations" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                <i class="fas fa-ticket-alt mr-2"></i> Mes réservations
              </router-link>
              <div class="border-t border-gray-100 my-1"></div>
              <button @click="logout" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="mr-4 text-primary font-medium">Connexion</router-link>
          <router-link to="/register" class="btn btn-primary">S'inscrire</router-link>
        </template>
      </div>
      
      <!-- Mobile menu button -->
      <button class="md:hidden" @click="toggleMobileMenu">
        <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 bg-white z-40 pt-20">
      <nav class="container mx-auto px-4 py-4">
        <ul class="space-y-4">
          <li>
            <router-link @click="closeMobileMenu" to="/" class="block text-lg font-medium py-2">
              Accueil
            </router-link>
          </li>
          <li>
            <router-link @click="closeMobileMenu" to="/movies" class="block text-lg font-medium py-2">
              Films
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link @click="closeMobileMenu" to="/admin" class="block text-lg font-medium py-2">
              Admin
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <router-link @click="closeMobileMenu" to="/profile" class="block text-lg font-medium py-2">
              Mon profil
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <router-link @click="closeMobileMenu" to="/reservations" class="block text-lg font-medium py-2">
              Mes réservations
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <button @click="logoutMobile" class="block text-lg font-medium py-2 text-red-600">
              Déconnexion
            </button>
          </li>
          <li v-else>
            <router-link @click="closeMobileMenu" to="/login" class="block text-lg font-medium py-2 text-primary">
              Connexion
            </router-link>
          </li>
          <li v-if="!isAuthenticated">
            <router-link @click="closeMobileMenu" to="/register" class="block text-lg font-medium py-2 bg-primary text-white rounded text-center">
              S'inscrire
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'TheHeader',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const showUserDropdown = ref(false);
    const mobileMenuOpen = ref(false);
    const userMenu = ref(null);
    
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const isAdmin = computed(() => store.getters['auth/isAdmin']);
    const user = computed(() => store.getters['auth/getUser']);
    const userName = computed(() => {
      return user.value ? user.value.name : 'Utilisateur';
    });
    
    const toggleUserDropdown = () => {
      showUserDropdown.value = !showUserDropdown.value;
    };
    
    const closeDropdown = (event) => {
      // Only close if clicked outside of dropdown menu
      if (!event.relatedTarget || 
          !userMenu.value || 
          !userMenu.value.contains(event.relatedTarget)) {
        showUserDropdown.value = false;
      }
    };
    
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
      
      // Prevent scrolling when menu is open
      if (mobileMenuOpen.value) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };
    
    const closeMobileMenu = () => {
      mobileMenuOpen.value = false;
      document.body.style.overflow = '';
    };
    
    const logout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push('/');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    
    const logoutMobile = async () => {
      closeMobileMenu();
      await logout();
    };
    
    // Close mobile menu on route change
    onMounted(() => {
      router.beforeEach((to, from, next) => {
        closeMobileMenu();
        next();
      });
    });
    
    // Ensure body overflow is restored when component is unmounted
    onUnmounted(() => {
      document.body.style.overflow = '';
    });
    
    return {
      isAuthenticated,
      isAdmin,
      userName,
      showUserDropdown,
      mobileMenuOpen,
      userMenu,
      toggleUserDropdown,
      closeDropdown,
      toggleMobileMenu,
      closeMobileMenu,
      logout,
      logoutMobile
    };
  }
};
</script>

<style>
/* Add custom styles for active links */
.active-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: currentColor;
}
</style>