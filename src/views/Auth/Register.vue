<template>
  <div class="bg-gray-50 py-12 md:py-16">
    <div class="max-w-md mx-auto px-4">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-primary text-white px-6 py-8 text-center">
          <h1 class="text-2xl font-bold mb-1">Inscription</h1>
          <p class="text-primary-100">Créer votre compte CineHall</p>
        </div>
        
        <!-- Form -->
        <form @submit.prevent="submitForm" class="p-6">
          <div v-if="errorMessage" class="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-center">
            {{ errorMessage }}
          </div>
          
          <div class="mb-4">
            <label for="name" class="block text-gray-700 font-medium mb-1">Nom complet</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name"
              required
              :class="[
                'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                errors.name ? 'border-red-500' : 'border-gray-300'
              ]"
              placeholder="Votre nom"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>
          
          <div class="mb-4">
            <label for="email" class="block text-gray-700 font-medium mb-1">Adresse email</label>
            <input 
              type="email" 
              id="email" 
              v-model="form.email"
              required
              :class="[
                'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                errors.email ? 'border-red-500' : 'border-gray-300'
              ]"
              placeholder="votre@email.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>
          
          <div class="mb-4">
            <label for="password" class="block text-gray-700 font-medium mb-1">Mot de passe</label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="form.password"
                required
                :class="[
                  'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                  errors.password ? 'border-red-500' : 'border-gray-300'
                ]"
                placeholder="Choisir un mot de passe"
              />
              <button 
                type="button"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                @click="showPassword = !showPassword"
              >
                <span v-if="showPassword" class="text-sm">🔒</span>
                <span v-else class="text-sm">👁️</span>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
          
          <div class="mb-6">
            <label for="password_confirmation" class="block text-gray-700 font-medium mb-1">Confirmer le mot de passe</label>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password_confirmation" 
              v-model="form.password_confirmation"
              required
              :class="[
                'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                passwordsMatch ? 'border-gray-300' : 'border-red-500'
              ]"
              placeholder="Confirmer votre mot de passe"
            />
            <p v-if="!passwordsMatch && form.password_confirmation" class="mt-1 text-sm text-red-600">
              Les mots de passe ne correspondent pas
            </p>
          </div>
          
          <div class="mb-6 flex items-start">
            <input 
              type="checkbox" 
              id="terms" 
              v-model="form.terms" 
              class="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              required
            />
            <label for="terms" class="ml-2 text-gray-700">
              J'accepte les <a href="#" class="text-primary hover:text-primary-dark">conditions d'utilisation</a> et la <a href="#" class="text-primary hover:text-primary-dark">politique de confidentialité</a>
            </label>
          </div>
          
          <button 
            type="submit" 
            class="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md font-medium transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="loading || !passwordsMatch || !form.terms"
          >
            <span v-if="loading" class="flex justify-center items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Inscription en cours...
            </span>
            <span v-else>S'inscrire</span>
          </button>
        </form>
        
        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 text-center">
          <p class="text-gray-700">
            Vous avez déjà un compte? 
            <router-link to="/login" class="text-primary hover:text-primary-dark font-medium">
              Se connecter
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'Register',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const loading = ref(false);
    const errorMessage = ref('');
    const showPassword = ref(false);
    const errors = reactive({});
    
    const form = reactive({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      terms: false
    });
    
    const passwordsMatch = computed(() => {
      if (!form.password_confirmation) return true;
      return form.password === form.password_confirmation;
    });
    
    const submitForm = async () => {
      if (!passwordsMatch.value) {
        errors.password_confirmation = 'Les mots de passe ne correspondent pas';
        return;
      }
      
      // Reset errors
      errorMessage.value = '';
      Object.keys(errors).forEach(key => delete errors[key]);
      
      loading.value = true;
      try {
        const { password_confirmation, terms, ...registerData } = form;
        await store.dispatch('auth/register', registerData);
        
        // Redirect to home
        router.push('/');
      } catch (error) {
        console.error('Registration error:', error);
        
        if (error.errors) {
          // Handle validation errors
          Object.assign(errors, error.errors);
        } else {
          errorMessage.value = error.message || 'L\'inscription a échoué. Veuillez réessayer.';
        }
      } finally {
        loading.value = false;
      }
    };
    
    return {
      form,
      loading,
      errorMessage,
      errors,
      showPassword,
      passwordsMatch,
      submitForm
    };
  }
};
</script>