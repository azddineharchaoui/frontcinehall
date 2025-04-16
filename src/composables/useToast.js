import { getCurrentInstance } from 'vue';

export function useToast() {
  const internalInstance = getCurrentInstance();
  
  // Toast functions
  const toast = {
    success(message, duration = 3000) {
      if (internalInstance) {
        return internalInstance.appContext.config.globalProperties.$toast.success(message, duration);
      } else {
        console.warn('Toast plugin not available');
      }
    },
    error(message, duration = 5000) {
      if (internalInstance) {
        return internalInstance.appContext.config.globalProperties.$toast.error(message, duration);
      } else {
        console.warn('Toast plugin not available');
      }
    },
    info(message, duration = 3000) {
      if (internalInstance) {
        return internalInstance.appContext.config.globalProperties.$toast.info(message, duration);
      } else {
        console.warn('Toast plugin not available');
      }
    },
    warning(message, duration = 4000) {
      if (internalInstance) {
        return internalInstance.appContext.config.globalProperties.$toast.warning(message, duration);
      } else {
        console.warn('Toast plugin not available');
      }
    }
  };
  
  return toast;
}