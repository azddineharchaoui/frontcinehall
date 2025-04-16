<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Mon profil</h1>
    
    <div v-if="loading" class="flex justify-center py-16">
      <loading-spinner message="Chargement du profil..." />
    </div>
    
    <div v-else-if="!user" class="text-center py-16 text-gray-500">
      <p>Impossible de charger les informations de votre profil.</p>
      <button @click="loadUserProfile" class="mt-4 text-primary hover:text-primary-dark">
        Réessayer
      </button>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Sidebar -->
      <div class="md:col-span-1">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="mb-6 text-center">
            <div class="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold mt-4">{{ user.name }}</h2>
            <p class="text-gray-500">{{ user.email }}</p>
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            <nav class="space-y-2">
              <button 
                @click="activeTab = 'information'" 
                :class="[
                  'w-full text-left px-3 py-2 rounded flex items-center transition-colors duration-200',
                  activeTab === 'information' ? 'bg-primary text-white' : 'hover:bg-gray-100'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informations personnelles
              </button>
              
              <button 
                @click="activeTab = 'security'" 
                :class="[
                  'w-full text-left px-3 py-2 rounded flex items-center transition-colors duration-200',
                  activeTab === 'security' ? 'bg-primary text-white' : 'hover:bg-gray-100'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Sécurité
              </button>
              
              <router-link 
                to="/reservations" 
                class="block w-full text-left px-3 py-2 rounded flex items-center transition-colors duration-200 hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Mes réservations
              </router-link>
            </nav>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="md:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-6">
          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'information'">
            <h3 class="text-xl font-bold mb-6">Informations personnelles</h3>
            
            <form @submit.prevent="updateProfile">
              <div class="mb-4">
                <label for="name" class="block text-gray-700 font-medium mb-1">Nom complet</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="profileForm.name"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                    profileErrors.name ? 'border-red-500' : 'border-gray-300'
                  ]"
                  placeholder="Votre nom"
                />
                <p v-if="profileErrors.name" class="mt-1 text-sm text-red-600">{{ profileErrors.name }}</p>
              </div>
              
              <div class="mb-4">
                <label for="email" class="block text-gray-700 font-medium mb-1">Adresse email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="profileForm.email"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                    profileErrors.email ? 'border-red-500' : 'border-gray-300'
                  ]"
                  placeholder="votre@email.com"
                />
                <p v-if="profileErrors.email" class="mt-1 text-sm text-red-600">{{ profileErrors.email }}</p>
              </div>
              
              <div class="mb-4">
                <label for="phone" class="block text-gray-700 font-medium mb-1">Téléphone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="profileForm.phone"
                  :class="[
                    'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                    profileErrors.phone ? 'border-red-500' : 'border-gray-300'
                  ]"
                  placeholder="+212 6XX XXX XXX"
                />
                <p v-if="profileErrors.phone" class="mt-1 text-sm text-red-600">{{ profileErrors.phone }}</p>
              </div>
              
              <div class="flex justify-end">
                <button 
                  type="submit"
                  class="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :disabled="profileLoading"
                >
                  <span v-if="profileLoading">Sauvegarde en cours...</span>
                  <span v-else>Mettre à jour</span>
                </button>
              </div>
            </form>
          </div>
          
          <!-- Security Tab -->
          <div v-if="activeTab === 'security'">
            <h3 class="text-xl font-bold mb-6">Sécurité</h3>
            
            <form @submit.prevent="changePassword">
              <div class="mb-4">
                <label for="current_password" class="block text-gray-700 font-medium mb-1">Mot de passe actuel</label>
                <input 
                  type="password" 
                  id="current_password" 
                  v-model="passwordForm.current_password"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                    passwordErrors.current_password ? 'border-red-500' : 'border-gray-300'
                  ]"
                />
                <p v-if="passwordErrors.current_password" class="mt-1 text-sm text-red-600">{{ passwordErrors.current_password }}</p>
              </div>
              
              <div class="mb-4">
                <label for="new_password" class="block text-gray-700 font-medium mb-1">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  id="new_password" 
                  v-model="passwordForm.new_password"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                    passwordErrors.new_password ? 'border-red-500' : 'border-gray-300'
                  ]"
                />
                <p v-if="passwordErrors.new_password" class="mt-1 text-sm text-red-600">{{ passwordErrors.new_password }}</p>
              </div>
              
              <div class="mb-6">
                <label for="new_password_confirmation" class="block text-gray-700 font-medium mb-1">Confirmer le nouveau mot de passe</label>
                <input 
                  type="password" 
                  id="new_password_confirmation" 
                  v-model="passwordForm.new_password_confirmation"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
                    !passwordsMatch && passwordForm.new_password_confirmation ? 'border-red-500' : 'border-gray-300'
                  ]"
                />
                <p v-if="!passwordsMatch && passwordForm.new_password_confirmation" class="mt-1 text-sm text-red-600">
                  Les mots de passe ne correspondent pas
                </p>
              </div>
              
              <div class="flex justify-end">
                <button 
                  type="submit"
                  class="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :disabled="passwordLoading || !passwordsMatch"
                >
                  <span v-if="passwordLoading">Modification en cours...</span>
                  <span v-else>Changer le mot de passe</span>
                </button>
              </div>
            </form>
            
            <hr class="my-8 border-gray-200">
            
            <div>
              <h4 class="text-lg font-semibold mb-4 text-red-600">Supprimer mon compte</h4>
              <p class="text-gray-700 mb-4">
                Cette action supprimera définitivement votre compte et toutes vos données. Elle ne peut pas être annulée.
              </p>
              
              <button 
                @click="confirmDeleteAccount" 
                class="text-red-600 border border-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-red-600" id="modal-title">Supprimer votre compte ?</h2>
            <p class="mt-2 text-gray-600">Cette action est irréversible et supprimera toutes vos données, y compris vos réservations.</p>
          </div>
          
          <div>
            <label for="confirm_password" class="block text-gray-700 font-medium mb-1">Entrez votre mot de passe pour confirmer</label>
            <input 
              type="password" 
              id="confirm_password" 
              v-model="deleteForm.password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showDeleteModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Annuler
            </button>
            <button 
              @click="deleteAccount" 
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
              :disabled="deleteLoading || !deleteForm.password"
            >
              <span v-if="deleteLoading">Suppression...</span>
              <span v-else>Confirmer la suppression</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'UserProfile',
  components: {
    LoadingSpinner
  },
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();
    
    const loading = ref(false);
    const activeTab = ref('information');
    const showDeleteModal = ref(false);
    
    // Profile form
    const profileForm = reactive({
      name: '',
      email: '',
      phone: ''
    });
    const profileErrors = reactive({});
    const profileLoading = ref(false);
    
    // Password form
    const passwordForm = reactive({
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    });
    const passwordErrors = reactive({});
    const passwordLoading = ref(false);
    const passwordsMatch = computed(() => {
      if (!passwordForm.new_password_confirmation) return true;
      return passwordForm.new_password === passwordForm.new_password_confirmation;
    });
    
    // Delete account
    const deleteForm = reactive({
      password: ''
    });
    const deleteLoading = ref(false);
    
    const user = computed(() => store.getters['auth/getUser']);
    
    const loadUserProfile = async () => {
      loading.value = true;
      try {
        await store.dispatch('auth/getProfile');
        initForms();
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Impossible de charger votre profil.');
      } finally {
        loading.value = false;
      }
    };
    
    const initForms = () => {
      if (user.value) {
        profileForm.name = user.value.name || '';
        profileForm.email = user.value.email || '';
        profileForm.phone = user.value.phone || '';
      }
    };
    
    const updateProfile = async () => {
      // Clear errors
      Object.keys(profileErrors).forEach(key => delete profileErrors[key]);
      
      profileLoading.value = true;
      try {
        await store.dispatch('auth/updateProfile', profileForm);
        toast.success('Profil mis à jour avec succès');
      } catch (error) {
        console.error('Error updating profile:', error);
        
        if (error.errors) {
          Object.assign(profileErrors, error.errors);
        } else {
          toast.error('Impossible de mettre à jour le profil.');
        }
      } finally {
        profileLoading.value = false;
      }
    };
    
    const changePassword = async () => {
      if (!passwordsMatch.value) {
        passwordErrors.new_password_confirmation = 'Les mots de passe ne correspondent pas';
        return;
      }
      
      // Clear errors
      Object.keys(passwordErrors).forEach(key => delete passwordErrors[key]);
      
      passwordLoading.value = true;
      try {
        await store.dispatch('auth/changePassword', passwordForm);
        toast.success('Mot de passe changé avec succès');
        
        // Reset form
        passwordForm.current_password = '';
        passwordForm.new_password = '';
        passwordForm.new_password_confirmation = '';
      } catch (error) {
        console.error('Error changing password:', error);
        
        if (error.errors) {
          Object.assign(passwordErrors, error.errors);
        } else {
          toast.error('Impossible de changer le mot de passe.');
        }
      } finally {
        passwordLoading.value = false;
      }
    };
    
    const confirmDeleteAccount = () => {
      showDeleteModal.value = true;
    };
    
    const deleteAccount = async () => {
      if (!deleteForm.password) {
        return;
      }
      
      deleteLoading.value = true;
      try {
        await store.dispatch('auth/deleteAccount', { password: deleteForm.password });
        toast.success('Votre compte a été supprimé');
        router.push('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Impossible de supprimer votre compte. Vérifiez votre mot de passe.');
      } finally {
        deleteLoading.value = false;
        showDeleteModal.value = false;
      }
    };
    
    onMounted(() => {
      loadUserProfile();
    });
    
    return {
      user,
      loading,
      loadUserProfile,
      activeTab,
      
      // Profile
      profileForm,
      profileErrors,
      profileLoading,
      updateProfile,
      
      // Password
      passwordForm,
      passwordErrors,
      passwordLoading,
      passwordsMatch,
      changePassword,
      
      // Delete account
      showDeleteModal,
      deleteForm,
      deleteLoading,
      confirmDeleteAccount,
      deleteAccount
    };
  }
};
</script>