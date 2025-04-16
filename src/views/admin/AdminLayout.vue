<template>
  <div class="admin-layout">
    <AdminSidebar :activePath="$route.path" />
    
    <div class="admin-content">
      <header class="admin-header">
        <div class="admin-header-title">
          <h1>Administration CineHall</h1>
        </div>
        <div class="admin-header-user">
          <span>{{ user.name }}</span>
          <button @click="logout" class="btn-logout">Déconnexion</button>
        </div>
      </header>
      
      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import { authService } from '../../services/authService'

const router = useRouter()
const user = ref({})

onMounted(() => {
  user.value = authService.getUser() || {}
  
  // Vérifier si l'utilisateur est admin
  if (user.value.role !== 'admin') {
    router.push('/connexion')
  }
})

function logout() {
  authService.logout()
    .then(() => {
      router.push('/connexion')
    })
    .catch(err => {
      console.error('Erreur lors de la déconnexion:', err)
    })
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header-title h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.admin-header-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-logout {
  padding: 8px 15px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.admin-main {
  padding: 30px;
  background-color: #f5f7fa;
  flex: 1;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .admin-header {
    padding: 15px;
  }
}
</style>