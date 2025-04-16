import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/main.css';

// Import toast notification plugin
import ToastPlugin from './plugins/toast';

// Import any globally used components here
import LoadingSpinner from './components/common/LoadingSpinner.vue';
import BaseButton from './components/common/BaseButton.vue';

// Create and configure the app
const app = createApp(App);

// Use plugins
app.use(store);
app.use(router);
app.use(ToastPlugin);

// Register global components
app.component('LoadingSpinner', LoadingSpinner);
app.component('BaseButton', BaseButton);

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err);
  console.error('Info:', info);
  
  // Show toast notification for error
  const toast = app.config.globalProperties.$toast;
  if (toast) {
    toast.error('Une erreur s\'est produite. Veuillez réessayer plus tard.');
  }
};

app.mount('#app');