<template>
  <header class="header">
    <div class="container header-container">
      <div class="logo">
        <router-link to="/">CineHall</router-link>
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/films" class="nav-link">Films</router-link>
      </nav>
      <div class="auth-buttons">
        <template v-if="isLoggedIn">
          <router-link to="/profil" class="nav-link">Mon Profil</router-link>
          <button @click="handleLogout" class="btn btn-sm">Déconnexion</button>
        </template>
        <template v-else>
          <router-link to="/connexion" class="btn btn-sm">Connexion</router-link>
          <router-link to="/inscription" class="btn btn-outline">Inscription</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const isLoggedIn = ref(false)
const router = useRouter()

onMounted(() => {
  checkAuthStatus()
})

function checkAuthStatus() {
  isLoggedIn.value = !!localStorage.getItem('token')
}

async function handleLogout() {
  try {
    await authService.logout()
    router.push('/')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script>

<style scoped>
.header {
  background-color: var(--secondary-color);
  padding: 15px 0;
  color: var(--light-text);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  color: var(--primary-color);
  font-size: 1.8rem;
  font-weight: 700;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: var(--light-text);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--primary-color);
}

.auth-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-sm {
  padding: 8px 15px;
  font-size: 0.9rem;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: var(--light-text);
}
</style>