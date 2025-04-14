<template>
  <div class="login-form">
    <h2>Connexion</h2>
    
    <div v-if="error" class="alert-error">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          required 
          placeholder="votre@email.com"
          :disabled="isLoading"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required 
          placeholder="Votre mot de passe"
          :disabled="isLoading"
        >
      </div>
      
      <div class="form-options">
        <div class="remember-me">
          <input type="checkbox" id="remember" v-model="remember">
          <label for="remember">Se souvenir de moi</label>
        </div>
        <a href="#" class="forgot-link">Mot de passe oublié ?</a>
      </div>
      
      <button 
        type="submit" 
        class="btn btn-full" 
        :disabled="isLoading"
      >
        {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
      </button>
    </form>
    
    <div class="register-link">
      Pas encore inscrit ? 
      <router-link to="/inscription">Créer un compte</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')
const isLoading = ref(false)

async function handleLogin() {
  error.value = ''
  isLoading.value = true
  
  try {
    const response = await authService.login({
      email: email.value,
      password: password.value,
      remember: remember.value
    })
    
    // Save token and user info
    authService.saveToken(response.data.token)
    authService.saveUser(response.data.user)
    
    // Redirect user
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    if (err.response && err.response.status === 401) {
      error.value = "Email ou mot de passe incorrect."
    } else {
      error.value = "Une erreur est survenue. Veuillez réessayer plus tard."
    }
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 25px;
  color: var(--text-color);
}

.alert-error {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 5px;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-full {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
}

.register-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>