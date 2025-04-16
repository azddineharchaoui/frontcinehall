import { createApp } from 'vue';
// import ToastComponent from '@/src/components/common/Toast.vue';

const ToastPlugin = {
  install(app) {
    const mountPoint = document.createElement('div');
    mountPoint.id = 'toast-container';
    document.body.appendChild(mountPoint);
    
    const toastContainer = createApp({
      name: 'ToastContainer',
      data() {
        return {
          toasts: []
        };
      },
      methods: {
        addToast(message, type, duration) {
          const id = Date.now().toString();
          this.toasts.push({ id, message, type, duration });
          
          setTimeout(() => {
            this.removeToast(id);
          }, duration);
          
          return id;
        },
        removeToast(id) {
          const index = this.toasts.findIndex(toast => toast.id === id);
          if (index !== -1) {
            this.toasts.splice(index, 1);
          }
        }
      },
      render() {
        return this.toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => this.removeToast(toast.id)}
          />
        ));
      }
    }).mount(mountPoint);
    
    const toast = {
      success(message, duration = 3000) {
        return toastContainer.addToast(message, 'success', duration);
      },
      error(message, duration = 5000) {
        return toastContainer.addToast(message, 'error', duration);
      },
      info(message, duration = 3000) {
        return toastContainer.addToast(message, 'info', duration);
      },
      warning(message, duration = 4000) {
        return toastContainer.addToast(message, 'warning', duration);
      }
    };
    
    app.config.globalProperties.$toast = toast;
    app.provide('toast', toast);
  }
};

export default ToastPlugin;