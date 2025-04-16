<template>
  <footer class="bg-dark text-gray-300 pt-12 pb-6 mt-16">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <!-- About Section -->
        <div>
          <h3 class="text-lg font-semibold text-primary mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-8 after:h-0.5 after:bg-primary">
            À propos de CineHall
          </h3>
          <p class="text-sm leading-relaxed">
            CineHall est votre destination cinématographique de premier choix, 
            offrant une expérience exceptionnelle avec les derniers films et des salles confortables.
          </p>
        </div>
        
        <!-- Quick Links Section -->
        <div>
          <h3 class="text-lg font-semibold text-primary mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-8 after:h-0.5 after:bg-primary">
            Liens Utiles
          </h3>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/" class="hover:text-primary transition-colors">Accueil</router-link></li>
            <li><router-link to="/movies" class="hover:text-primary transition-colors">Films</router-link></li>
            <li><router-link to="/contact" class="hover:text-primary transition-colors">Contact</router-link></li>
            <li><router-link to="/faq" class="hover:text-primary transition-colors">FAQ</router-link></li>
          </ul>
        </div>
        
        <!-- Social Section -->
        <div>
          <h3 class="text-lg font-semibold text-primary mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-8 after:h-0.5 after:bg-primary">
            Suivez-nous
          </h3>
          <div class="flex space-x-3">
            <a href="#" target="_blank" rel="noopener" title="Facebook" 
              class="w-9 h-9 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" target="_blank" rel="noopener" title="Instagram"
              class="w-9 h-9 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" target="_blank" rel="noopener" title="Twitter"
              class="w-9 h-9 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" target="_blank" rel="noopener" title="YouTube"
              class="w-9 h-9 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
              <i class="fab fa-youtube"></i>
            </a>
          </div>
        </div>
        
        <!-- Contact Section -->
        <div>
          <h3 class="text-lg font-semibold text-primary mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-8 after:h-0.5 after:bg-primary">
            Contact
          </h3>
          <div class="space-y-2 text-sm">
            <p class="flex items-center">
              <i class="fas fa-map-marker-alt text-primary mr-2"></i>
              123 Avenue du Cinéma, Casablanca
            </p>
            <p class="flex items-center">
              <i class="fas fa-phone text-primary mr-2"></i>
              +212 522 123 456
            </p>
            <p class="flex items-center">
              <i class="fas fa-envelope text-primary mr-2"></i>
              contact@cinehall.ma
            </p>
          </div>
        </div>
      </div>
      
      <!-- Footer Bottom -->
      <div class="pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
        <p class="text-sm">
          &copy; {{ currentYear }} CineHall. Tous droits réservés.
        </p>
        <div class="text-sm mt-2 md:mt-0">
          <router-link to="/privacy" class="hover:text-primary transition-colors">
            Politique de confidentialité
          </router-link>
          <span class="mx-2">|</span>
          <router-link to="/terms" class="hover:text-primary transition-colors">
            Conditions d'utilisation
          </router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'TheFooter',
  
  setup() {
    const currentYear = computed(() => new Date().getFullYear());
    
    return {
      currentYear
    };
  }
};
</script>