<template>
  <button 
    :type="type" 
    :class="[
      'inline-flex items-center justify-center relative py-2 px-5 rounded font-medium transition-all duration-300',
      {
        'w-full': block,
        'opacity-70 cursor-not-allowed': disabled || loading,
        'bg-primary text-white hover:bg-primary-dark': variant === 'primary',
        'bg-secondary text-white hover:bg-secondary-dark': variant === 'secondary',
        'bg-success text-white hover:bg-success-dark': variant === 'success',
        'bg-danger text-white hover:bg-danger-dark': variant === 'danger',
        'bg-warning text-white hover:bg-warning-dark': variant === 'warning',
        'border border-primary text-primary hover:bg-primary hover:text-white': variant === 'outline',
        'bg-transparent text-primary hover:bg-primary/10': variant === 'text',
      }
    ]"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <div v-if="loading" class="absolute w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    <span :class="{ 'opacity-0': loading }">
      <slot></slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'button'
    },
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'outline', 'text'].includes(value)
    },
    block: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const onClick = (event) => {
      if (!props.disabled && !props.loading) {
        emit('click', event);
      }
    };
    
    return {
      onClick
    };
  }
};
</script>