<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import Alert from '../../../ui/alert/Alert.vue';

const auth = useAuth();
const router = useRouter();
const route = useRoute();

const email = typeof route.query.email === 'string' ? route.query.email : '';
const token = typeof route.query.token === 'string' ? route.query.token : '';
const missingParams = !email || !token;

const password = ref('');
const loading = ref(false);
const showPassword = ref(false);
const error = ref<string | null>(null);
const touched = ref(false);

const passwordInvalid = computed(
  () => touched.value && (!password.value || password.value.length < 8)
);

async function submit(): Promise<void> {
  touched.value = true;
  if (!password.value || password.value.length < 8) return;

  loading.value = true;
  error.value = null;
  try {
    await auth.resetPassword({ email, token, password: password.value });
    await router.push('/');
  } catch (err: unknown) {
    loading.value = false;
    const e = err as { status?: number; message?: string };
    if (e?.status === 401) error.value = 'This reset link is invalid or has expired.';
    else error.value = e?.message ?? 'Something went wrong. Please try again.';
  }
}
</script>

<template>
  <main v-if="missingParams" class="auth-page">
    <div class="auth-card">
      <h1>Invalid link</h1>
      <p>This password reset link is missing required information.</p>
      <p class="auth-links"><RouterLink to="/auth/forgot-password">Request a new link</RouterLink></p>
    </div>
  </main>

  <main v-else class="auth-page">
    <form class="auth-card" novalidate @submit.prevent="submit">
      <h1>Set a new password</h1>

      <Alert v-if="error" type="error" @close="error = null">{{ error }}</Alert>

      <label for="reset-password">New password</label>
      <div class="password-field">
        <input
          id="reset-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :aria-invalid="passwordInvalid || undefined"
          :aria-describedby="passwordInvalid ? 'error-password' : undefined"
          @blur="touched = true"
        />
        <button type="button" class="btn-toggle-password" @click="showPassword = !showPassword">
          {{ showPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <p v-if="passwordInvalid" id="error-password" class="field-error">
        Password must be at least 8 characters.
      </p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Saving…' : 'Set password' }}
      </button>
    </form>
  </main>
</template>
