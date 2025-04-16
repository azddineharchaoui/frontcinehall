<template>
  <div class="movie-form-page">
    <div class="page-header">
      <h1>{{ isEditMode ? 'Modifier le film' : 'Ajouter un film' }}</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement des données...</p>
    </div>
    
    <div v-else class="content-card">
      <form @submit.prevent="saveMovie" class="movie-form">
        <div class="form-grid">
          <div class="form-section">
            <h3>Informations générales</h3>
            
            <div class="form-group">
              <label for="title">Titre *</label>
              <input 
                type="text" 
                id="title" 
                v-model="movieForm.title" 
                required
                placeholder="Titre du film"
              >
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="duration">Durée (min) *</label>
                <input 
                  type="number" 
                  id="duration" 
                  v-model="movieForm.duration" 
                  required
                  min="1"
                  placeholder="Durée en minutes"
                >
              </div>
              
              <div class="form-group">
                <label for="release_date">Date de sortie *</label>
                <input 
                  type="date" 
                  id="release_date" 
                  v-model="movieForm.release_date" 
                  required
                >
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="genre">Genre *</label>
                <input 
                  type="text" 
                  id="genre" 
                  v-model="movieForm.genre" 
                  required
                  placeholder="Ex: Action, Comédie, etc."
                >
              </div>
              
              <div class="form-group">
                <label for="min_age">Âge minimum</label>
                <input 
                  type="number" 
                  id="min_age" 
                  v-model="movieForm.min_age"
                  min="0"
                  placeholder="Âge minimum requis"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">Description *</label>
              <textarea 
                id="description" 
                v-model="movieForm.description" 
                required
                rows="5"
                placeholder="Synopsis du film"
              ></textarea>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Médias et détails supplémentaires</h3>
            
            <div class="form-group">
              <label for="trailer_url">URL de la bande-annonce (YouTube)</label>
              <input 
                type="url" 
                id="trailer_url" 
                v-model="movieForm.trailer_url"
                placeholder="https://youtu.be/..."
              >
            </div>
            
            <div class="form-group">
              <label for="director">Réalisateur</label>
              <input 
                type="text" 
                id="director" 
                v-model="movieForm.director"
                placeholder="Nom du réalisateur"
              >
            </div>
            
            <div class="form-group">
              <label for="cast">Casting (séparés par des virgules)</label>
              <input 
                type="text" 
                id="cast" 
                v-model="movieForm.cast_input"
                placeholder="Acteur 1, Acteur 2, Acteur 3..."
              >
            </div>
            
            <div class="form-group">
              <label>Affiche du film</label>
              <div class="image-upload">
                <div 
                  class="upload-area"
                  @dragover.prevent="onDragOver"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="onFileDrop($event, 'poster')"
                >
                  <input 
                    type="file" 
                    ref="posterInput"
                    @change="onFileSelect($event, 'poster')"
                    accept="image/*"
                    class="file-input"
                  >
                  <div v-if="movieForm.poster_url || posterPreview" class="image-preview">
                    <img :src="posterPreview || movieForm.poster_url" alt="Aperçu de l'affiche">
                    <button type="button" class="remove-image" @click="removePoster">×</button>
                  </div>
                  <div v-else class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Glissez une image ou cliquez pour sélectionner</span>
                    <button type="button" class="btn btn-sm" @click="$refs.posterInput.click()">
                      Parcourir
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Image de fond (backdrop)</label>
              <div class="image-upload">
                <div 
                  class="upload-area"
                  @dragover.prevent="onDragOver"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="onFileDrop($event, 'backdrop')"
                >
                  <input 
                    type="file" 
                    ref="backdropInput"
                    @change="onFileSelect($event, 'backdrop')"
                    accept="image/*"
                    class="file-input"
                  >
                  <div v-if="movieForm.backdrop_url || backdropPreview" class="image-preview backdrop-preview">
                    <img :src="backdropPreview || movieForm.backdrop_url" alt="Aperçu du backdrop">
                    <button type="button" class="remove-image" @click="removeBackdrop">×</button>
                  </div>
                  <div v-else class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Glissez une image ou cliquez pour sélectionner</span>
                    <button type="button" class="btn btn-sm" @click="$refs.backdropInput.click()">
                      Parcourir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="status">Statut</label>
          <select v-model="movieForm.status">
            <option value="active">Actif</option>
            <option value="upcoming">À venir</option>
            <option value="ended">Terminé</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn btn-outline">Annuler</button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Enregistrement...</span>
            <span v-else>{{ isEditMode ? 'Mettre à jour' : 'Ajouter' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { movieService } from '../../services/movieService'
import { adminService } from '../../services/adminService'

const route = useRoute()
const router = useRouter()
const movieId = route.params.id

// États
const loading = ref(false)
const isSubmitting = ref(false)
const error = ref(null)
const isDragging = ref(false)
const posterInput = ref(null)
const backdropInput = ref(null)
const posterPreview = ref(null)
const backdropPreview = ref(null)

const movieForm = ref({
  title: '',
  duration: '',
  release_date: '',
  genre: '',
  description: '',
  min_age: '',
  trailer_url: '',
  director: '',
  cast_input: '',
  status: 'active',
  poster: null,
  backdrop: null,
  poster_url: '',
  backdrop_url: ''
})

// Computed
const isEditMode = computed(() => {
  return !!movieId
})

// Méthodes
async function fetchMovie() {
  loading.value = true
  
  try {
    const response = await movieService.getMovie(movieId)
    const movie = response.data
    
    // Remplir le formulaire avec les données du film
    movieForm.value = {
      ...movieForm.value,
      title: movie.title,
      duration: movie.duration,
      release_date: formatDateForInput(movie.release_date),
      genre: movie.genre,
      description: movie.description,
      min_age: movie.min_age || '',
      trailer_url: movie.trailer_url || '',
      director: movie.director || '',
      cast_input: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
      status: movie.status || 'active',
      poster_url: movie.poster_url || '',
      backdrop_url: movie.backdrop_url || ''
    }
  } catch (err) {
    error.value = "Erreur lors du chargement du film."
    console.error('Error fetching movie:', err)
  } finally {
    loading.value = false
  }
}

function formatDateForInput(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

function onDragOver(event) {
  isDragging.value = true
}

function onFileDrop(event, type) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  handleFile(file, type)
}

function onFileSelect(event, type) {
  const file = event.target.files[0]
  handleFile(file, type)
}

function handleFile(file, type) {
  if (!file) return
  
  if (!file.type.includes('image/')) {
    alert('Veuillez sélectionner une image valide.')
    return
  }
  
  const reader = new FileReader()
  
  reader.onload = (e) => {
    if (type === 'poster') {
      posterPreview.value = e.target.result
      movieForm.value.poster = file
    } else if (type === 'backdrop') {
      backdropPreview.value = e.target.result
      movieForm.value.backdrop = file
    }
  }
  
  reader.readAsDataURL(file)
}

function removePoster() {
  posterPreview.value = null
  movieForm.value.poster = null
  movieForm.value.poster_url = ''
  if (posterInput.value) posterInput.value.value = ''
}

function removeBackdrop() {
  backdropPreview.value = null
  movieForm.value.backdrop = null
  movieForm.value.backdrop_url = ''
  if (backdropInput.value) backdropInput.value.value = ''
}

async function saveMovie() {
  isSubmitting.value = true
  error.value = null
  
  try {
    // Préparer les données du formulaire
    const formData = {
      ...movieForm.value,
      cast: movieForm.value.cast_input ? movieForm.value.cast_input.split(',').map(item => item.trim()) : []
    }
    
    delete formData.cast_input
    
    if (isEditMode.value) {
      await adminService.updateMovie(movieId, formData)
    } else {
      await adminService.createMovie(formData)
    }
    
    // Rediriger vers la liste des films
    router.push('/admin/films')
  } catch (err) {
    error.value = "Erreur lors de l'enregistrement du film."
    console.error('Error saving movie:', err)
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push('/admin/films')
}

// Cycle de vie
onMounted(() => {
  if (isEditMode.value) {
    fetchMovie()
  }
})
</script>
<style scoped>
.movie-form-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--secondary-color);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.movie-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.form-section h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: var(--secondary-color);
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.image-upload .upload-area {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.image-upload .upload-area:hover {
  border-color: var(--primary-color);
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #666;
}

.upload-placeholder i {
  font-size: 2rem;
  color: #999;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.backdrop-preview img {
  max-height: 150px;
  object-fit: cover;
  width: 100%;
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  color: var(--secondary-color);
  border: 1px solid #ddd;
}

@media (max-width: 992px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>