<template>
  <transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transform ease-in duration-200 transition"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div :class="[
      'flex items-center p-4 rounded-md shadow-lg mb-3 min-w-[300px] max-w-md',
      {
        'border-l-4 border-primary bg-white': type === 'info',
        'border-l-4 border-success bg-white': type === 'success',
        'border-l-4 border-warning bg-white': type === 'warning',
        'border-l-4 border-danger bg-white': type === 'error'
      }
    ]">
      <div class="flex-shrink-0 mr-3">
        <i :class="[
          'text-xl',
          {
            'fas fa-info-circle text-primary': type === 'info',
            'fas fa-check-circle text-success': type === 'success',
            'fas fa-exclamation-triangle text-warning': type === 'warning',
            'fas fa-times-circle text-danger': type === 'error'
          }
        ]"></i>
      </div>
      <div class="flex-1 text-sm mr-2">{{ message }}</div>
      <button 
        @click="close" 
        class="ml-4 text-gray-400 hover:text-gray-600 text-lg leading-none font-semibold"
      >
        ×
      </button>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'success', 'warning', 'error'].includes(value)
    },
    onClose: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const close = () => {
      props.onClose();
    };
    
    return {
      close
    };
  }
};
</script>