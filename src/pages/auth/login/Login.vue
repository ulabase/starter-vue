<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import { environment } from '../../../environments/environment';
import OAuthButtons from '../oauth-buttons/OAuthButtons.vue';
import Alert from '../../../ui/alert/Alert.vue';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: 'This link is invalid or has expired.',
  token_expired:
    'This verification link has expired. Use "Forgot password?" below to get a new link: it also verifies your email.',
};

const auth = useAuth();
const router = useRouter();
const route = useRoute();
const features = environment.features;

const errorParam = typeof route.query.error === 'string' ? route.query.error : '';

const email = ref('');
const password = ref('');
const loading = ref(false);
const showPassword = ref(false);
const error = ref<string | null>(ERROR_MESSAGES[errorParam] ?? null);
const touched = reactive({ email: false, password: false });

const emailInvalid = computed(() => touched.email && (!email.value || !email.value.includes('@')));
const passwordInvalid = computed(() => touched.password && !password.value);

async function submit(): Promise<void> {
  touched.email = true;
  touched.password = true;
  if (!email.value || !email.value.includes('@') || !password.value) return;

  loading.value = true;
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    await router.push('/');
  } catch (err: unknown) {
    loading.value = false;
    const e = err as { status?: number; message?: string };
    if (e?.status === 401) error.value = 'Invalid email or password.';
    else error.value = e?.message ?? 'Something went wrong. Please try again.';
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1>Log in</h1>

      <Alert v-if="error" type="error" @close="error = null">{{ error }}</Alert>

      <template v-if="features.oauthLogin">
        <OAuthButtons :providers="features.oauthProviders" />
        <div class="divider"><span>OR</span></div>
      </template>

      <form novalidate @submit.prevent="submit">
        <label for="login-email">Email</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          autocomplete="email"
          :aria-invalid="emailInvalid || undefined"
          :aria-describedby="emailInvalid ? 'error-email' : undefined"
          @blur="touched.email = true"
        />
        <p v-if="emailInvalid" id="error-email" class="field-error">Enter a valid email address.</p>

        <label for="login-password">Password</label>
        <div class="password-field">
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            :aria-invalid="passwordInvalid || undefined"
            :aria-describedby="passwordInvalid ? 'error-password' : undefined"
            @blur="touched.password = true"
          />
          <button type="button" class="btn-toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
        <p v-if="passwordInvalid" id="error-password" class="field-error">Password is required.</p>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in…' : 'Log in' }}
        </button>
      </form>

      <p class="auth-links">
        <RouterLink v-if="features.passwordReset" to="/auth/forgot-password">Forgot password?</RouterLink>
        <template v-if="features.passwordReset && (features.emailRegistration || features.oauthLogin)"> · </template>
        <RouterLink v-if="features.emailRegistration || features.oauthLogin" to="/auth/signup">Create an account</RouterLink>
      </p>
    </div>
  </main>
</template>
