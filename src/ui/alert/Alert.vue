<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = withDefaults(
  defineProps<{
    type: 'success' | 'error';
    dismissible?: boolean;
    autoDismiss?: number;
  }>(),
  { dismissible: true, autoDismiss: 4000 }
);

const emit = defineEmits<{ close: [] }>();

let timer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  if (props.autoDismiss > 0) {
    timer = setTimeout(() => emit('close'), props.autoDismiss);
  }
});

onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <div
    :class="type === 'success' ? 'success-msg' : 'form-error'"
    :role="type === 'success' ? 'status' : 'alert'"
  >
    <span style="flex: 1"><slot /></span>
    <button
      v-if="dismissible"
      type="button"
      aria-label="Dismiss"
      style="
        flex-shrink: 0;
        font: inherit;
        font-size: 1.125rem;
        line-height: 1;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        opacity: 0.6;
        color: inherit;
      "
      @click="emit('close')"
    >
      &times;
    </button>
  </div>
</template>
