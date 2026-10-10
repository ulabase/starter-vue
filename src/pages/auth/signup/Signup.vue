<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import { environment } from '../../../environments/environment';
import OAuthButtons from '../oauth-buttons/OAuthButtons.vue';
import Alert from '../../../ui/alert/Alert.vue';

const auth = useAuth();
const features = environment.features;

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const showPassword = ref(false);
const error = ref<string | null>(null);
const submitted = ref(false);
const touched = reactive({ firstName: false, lastName: false, email: false, password: false });

const emailInvalid = computed(() => touched.email && (!email.value || !email.value.includes('@')));
const passwordInvalid = computed(
  () => touched.password && (!password.value || password.value.length < 8)
);

async function submit(): Promise<void> {
  Object.assign(touched, { firstName: true, lastName: true, email: true, password: true });
  if (
    !firstName.value ||
    !lastName.value ||
    !email.value ||
    !email.value.includes('@') ||
    !password.value ||
    password.value.length < 8
  )
    return;

  loading.value = true;
  error.value = null;
  const teamName = firstName.value
    ? `${firstName.value}'s Team`
    : `${email.value.split('@')[0]}'s Team`;

  try {
    await auth.register({
      teamName,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    });
    submitted.value = true;
  } catch (err: unknown) {
    loading.value = false;
    const e = err as { status?: number; message?: string };
    if (e?.status === 409) error.value = 'An account with this email already exists.';
    else error.value = e?.message ?? 'Something went wrong. Please try again.';
  }
}
</script>

<template>
  <main v-if="submitted" class="auth-page">
    <div class="auth-card">
      <h1>Check your email</h1>
      <p>We sent a verification link to confirm your account. Click it to finish signing up.</p>
    </div>
  </main>

  <main v-else class="auth-page">
    <div class="auth-card">
      <h1>Create an account</h1>

      <Alert v-if="error" type="error" @close="error = null">{{ error }}</Alert>

      <template v-if="features.oauthLogin">
        <OAuthButtons :providers="features.oauthProviders" />
        <div v-if="features.emailRegistration" class="divider"><span>OR</span></div>
      </template>

      <form v-if="features.emailRegistration" novalidate @submit.prevent="submit">
        <label for="signup-firstName">First name</label>
        <input
          id="signup-firstName"
          v-model="firstName"
          type="text"
          autocomplete="given-name"
          @blur="touched.firstName = true"
        />
        <p v-if="touched.firstName && !firstName" class="field-error">First name is required.</p>

        <label for="signup-lastName">Last name</label>
        <input
          id="signup-lastName"
          v-model="lastName"
          type="text"
          autocomplete="family-name"
          @blur="touched.lastName = true"
        />
        <p v-if="touched.lastName && !lastName" class="field-error">Last name is required.</p>

        <label for="signup-email">Email</label>
        <input
          id="signup-email"
          v-model="email"
          type="email"
          autocomplete="email"
          :aria-invalid="emailInvalid || undefined"
          :aria-describedby="emailInvalid ? 'error-email' : undefined"
          @blur="touched.email = true"
        />
        <p v-if="emailInvalid" id="error-email" class="field-error">Enter a valid email address.</p>

        <label for="signup-password">Password</label>
        <div class="password-field">
          <input
            id="signup-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :aria-invalid="passwordInvalid || undefined"
            :aria-describedby="passwordInvalid ? 'error-password' : undefined"
            @blur="touched.password = true"
          />
          <button type="button" class="btn-toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
        <p v-if="passwordInvalid" id="error-password" class="field-error">
          Password must be at least 8 characters.
        </p>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="auth-links">
        Already have an account? <RouterLink to="/auth/login">Log in</RouterLink>
      </p>
    </div>
  </main>
</template>
