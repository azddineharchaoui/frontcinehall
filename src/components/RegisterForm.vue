<template>
  <div class="register-form">
    <h2>Créer un compte</h2>
    
    <div v-if="error" class="alert-error">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">Nom complet</label>
        <input 
          type="text" 
          id="name" 
          v-model="name" 
          required 
          placeholder="Votre nom"
          :disabled="isLoading"
        >
      </div>
      
      <div class="form-group">
        <label for="reg-email">Email</label>
        <input 
          type="email" 
          id="reg-email" 
          v-model="email" 
          required 
          placeholder="votre@email.com"
          :disabled="isLoading"
        >
      </div>
      
      <div class="form-group">
        <label for="reg-password">Mot de passe</label>
        <input 
          type="password" 
          id="reg-password" 
          v-model="password" 
          required 
          placeholder="Minimum 8 caractères"
          :disabled="isLoading"
        >
      </div>
      
      <div class="form-group">
        <label for="password-confirmation">Confirmer le mot de passe</label>
        <input 
          type="password" 
          id="password-confirmation" 
          v-model="passwordConfirmation" 
          required 
          placeholder="Répéter le mot de passe"
          :disabled="isLoading"
        >
      </div>
      
      <div class="form-group terms-check">
        <input type="checkbox" id="accept-terms" v-model="acceptTerms" required>
        <label for="accept-terms">J'accepte les <a href="#">conditions d'utilisation</a> et la <a href="#">politique de confidentialité</a></label>
      </div>
      
      <button 
        type="submit" 
        class="btn btn-full" 
        :disabled="isLoading || !acceptTerms || password !== passwordConfirmation"
      >
        {{ isLoading ? 'Inscription en cours...' : 'S\'inscrire' }}
      </button>
    </form>
    
    <div class="login-link">
      Déjà inscrit ? 
      <router-link to="/connexion">Se connecter</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const acceptTerms = ref(false)
const error = ref('')
const isLoading = ref(false)

async function handleRegister() {
  error.value = ''
  
  if (password.value !== passwordConfirmation.value) {
    error.value = "Les mots de passe ne correspondent pas."
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await authService.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })
    
    // Save token and user info
    authService.saveToken(response.data.token)
    authService.saveUser(response.data.user)
    
    // Redirect user to homepage
    router.push('/')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      // Validation errors
      const validationErrors = err.response.data.errors
      if (validationErrors.email) {
        error.value = validationErrors.email[0]
      } else if (validationErrors.password) {
        error.value = validationErrors.password[0]
      } else {
        error.value = "Veuillez vérifier les informations saisies."
      }
    } else {
      error.value = "Une erreur est survenue lors de l'inscription. Veuillez réessayer plus tard."
    }
    console.error('Registration error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.register-form h2 {
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.terms-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.terms-check input {
  width: auto;
  margin-top: 5px;
}

.terms-check label {
  font-size: 0.9rem;
  line-height: 1.4;
}

.terms-check a {
  color: var(--primary-color);
  text-decoration: none;
}

.terms-check a:hover {
  text-decoration: underline;
}

.btn-full {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>