<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';

const auth = useAuth();

const email = ref('');
const loading = ref(false);
const submitted = ref(false);
const touched = ref(false);

const emailInvalid = computed(() => touched.value && (!email.value || !email.value.includes('@')));

async function submit(): Promise<void> {
  touched.value = true;
  if (!email.value || !email.value.includes('@')) return;

  loading.value = true;
  // The API always returns 202 regardless of whether the email exists,
  // to avoid leaking which emails are registered — show the same confirmation either way.
  try {
    await auth.forgotPassword(email.value);
  } catch {
    // ignore
  }
  submitted.value = true;
}
</script>

<template>
  <main v-if="submitted" class="auth-page">
    <div class="auth-card">
      <h1>Check your email</h1>
      <p>If an account exists for that address, we sent a link to reset your password.</p>
    </div>
  </main>

  <main v-else class="auth-page">
    <form class="auth-card" novalidate @submit.prevent="submit">
      <h1>Forgot your password?</h1>
      <p>Enter your email and we'll send you a reset link.</p>

      <label for="forgot-email">Email</label>
      <input
        id="forgot-email"
        v-model="email"
        type="email"
        autocomplete="email"
        @blur="touched = true"
      />
      <p v-if="emailInvalid" class="field-error">Enter a valid email address.</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending…' : 'Send reset link' }}
      </button>

      <p class="auth-links">
        <RouterLink to="/auth/login">Back to log in</RouterLink>
      </p>
    </form>
  </main>
</template>
