<template>
  <div :class="[
    'flex flex-col items-center justify-center p-5', 
    overlay ? 'fixed inset-0 bg-white bg-opacity-80 z-50' : ''
  ]">
    <div class="flex justify-center space-x-2 mb-4">
      <div class="w-3 h-3 bg-primary rounded-full animate-bounce" style="animation-delay: -0.32s"></div>
      <div class="w-3 h-3 bg-primary rounded-full animate-bounce" style="animation-delay: -0.16s"></div>
      <div class="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
    </div>
    <p v-if="message" class="text-sm text-gray-500">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: ''
    },
    overlay: {
      type: Boolean,
      default: false
    }
  }
};
</script>