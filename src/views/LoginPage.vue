<template>
  <div class="login-page container">
    <div class="auth-container">
      <div class="auth-banner">
        <div class="banner-content">
          <h2>Bienvenue sur CineHall</h2>
          <p>Connectez-vous pour réserver vos places et profiter d'une expérience cinématographique unique</p>
        </div>
      </div>
      
      <div class="auth-form-container">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue';
</script>

<style scoped>
.login-page {
  padding: 40px 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  display: flex;
  max-width: 900px;
  width: 100%;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.auth-banner {
  flex: 1;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), 
    url('https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 40px;
  position: relative;
  display: flex;
  align-items: center;
}

.banner-content {
  position: relative;
  z-index: 1;
}

.banner-content h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.banner-content p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.auth-form-container {
  flex: 1;
  padding: 40px;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }
  
  .auth-banner {
    padding: 30px;
    text-align: center;
  }
}
</style>