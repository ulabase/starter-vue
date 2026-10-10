<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import Alert from '../../../ui/alert/Alert.vue';

const auth = useAuth();
const router = useRouter();
const route = useRoute();

const email = typeof route.query.email === 'string' ? route.query.email : '';
const token = typeof route.query.token === 'string' ? route.query.token : '';
const missingParams = !email || !token;

const loading = ref(!missingParams);
const error = ref<string | null>(null);
const invitation = ref<{ isNewUser: boolean; teamName: string } | null>(null);
const done = ref(false);

const newUserPassword = ref('');
const showNewUserPassword = ref(false);
const newUserTouched = ref(false);

const loginPassword = ref('');
const showLoginPassword = ref(false);

const newUserPasswordInvalid = computed(
  () => newUserTouched.value && (!newUserPassword.value || newUserPassword.value.length < 8)
);

onMounted(() => {
  if (missingParams) return;
  auth.getInvitation(email, token).then(
    inv => {
      invitation.value = inv;
      loading.value = false;
    },
    (err: unknown) => {
      loading.value = false;
      const e = err as { status?: number; message?: string };
      if (e?.status === 404) error.value = 'This invitation is invalid or has expired.';
      else error.value = e?.message ?? 'Something went wrong. Please try again.';
    }
  );
});

function messageFor(err: unknown): string {
  const e = err as { status?: number; message?: string };
  if (e?.status === 404) return 'This invitation is invalid or has expired.';
  if (e?.status === 401) return 'Invalid password.';
  return e?.message ?? 'Something went wrong. Please try again.';
}

async function submitNewUser(): Promise<void> {
  newUserTouched.value = true;
  if (!newUserPassword.value || newUserPassword.value.length < 8) return;
  try {
    await auth.activate({ email, token, password: newUserPassword.value });
    await router.push('/');
  } catch (err: unknown) {
    error.value = messageFor(err);
  }
}

async function submitLoginAndAccept(): Promise<void> {
  if (!loginPassword.value) return;
  try {
    await auth.login(email, loginPassword.value);
    await acceptForLoggedInUser();
  } catch (err: unknown) {
    error.value = messageFor(err);
  }
}

async function acceptForLoggedInUser(): Promise<void> {
  try {
    await auth.acceptInvite(token);
    done.value = true;
    setTimeout(() => router.push('/'), 1200);
  } catch (err: unknown) {
    error.value = messageFor(err);
  }
}
</script>

<template>
  <main v-if="missingParams" class="auth-page">
    <div class="auth-card">
      <h1>Invalid invitation link</h1>
      <p>This link is missing required information.</p>
    </div>
  </main>

  <main v-else-if="loading" class="auth-page">
    <div class="auth-card">
      <p>Loading invitation…</p>
    </div>
  </main>

  <main v-else-if="done" class="auth-page">
    <div class="auth-card">
      <h1>You're in</h1>
      <p>Redirecting…</p>
    </div>
  </main>

  <main v-else-if="invitation?.isNewUser" class="auth-page">
    <form class="auth-card" novalidate @submit.prevent="submitNewUser">
      <h1>Join {{ invitation.teamName }}</h1>
      <p>Set a password to activate your account.</p>

      <Alert v-if="error" type="error" @close="error = null">{{ error }}</Alert>

      <label for="accept-password">Password</label>
      <div class="password-field">
        <input
          id="accept-password"
          v-model="newUserPassword"
          :type="showNewUserPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :aria-invalid="newUserPasswordInvalid || undefined"
          :aria-describedby="newUserPasswordInvalid ? 'error-password' : undefined"
          @blur="newUserTouched = true"
        />
        <button
          type="button"
          class="btn-toggle-password"
          @click="showNewUserPassword = !showNewUserPassword"
        >
          {{ showNewUserPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <p v-if="newUserPasswordInvalid" id="error-password" class="field-error">
        Password must be at least 8 characters.
      </p>

      <button type="submit" :disabled="!newUserPassword || newUserPassword.length < 8">
        Join team
      </button>
    </form>
  </main>

  <main v-else-if="auth.isAuthenticated.value" class="auth-page">
    <div class="auth-card">
      <h1>Join {{ invitation?.teamName }}</h1>
      <p>You're signed in as {{ email }}.</p>
      <Alert v-if="error" type="error" @close="error = null">{{ error }}</Alert>
      <button type="button" @click="acceptForLoggedInUser">Join team</button>
    </div>
  </main>

  <main v-else class="auth-page">
    <form class="auth-card" novalidate @submit.prevent="submitLoginAndAccept">
      <h1>Log in to join {{ invitation?.teamName }}</h1>
      <p>{{ email }}</p>

      <Alert v-if="error" type="error" @close="error = null">{{ error }}</Alert>

      <label for="accept-login-password">Password</label>
      <div class="password-field">
        <input
          id="accept-login-password"
          v-model="loginPassword"
          :type="showLoginPassword ? 'text' : 'password'"
          autocomplete="current-password"
        />
        <button
          type="button"
          class="btn-toggle-password"
          @click="showLoginPassword = !showLoginPassword"
        >
          {{ showLoginPassword ? 'Hide' : 'Show' }}
        </button>
      </div>

      <button type="submit" :disabled="!loginPassword">Log in and join</button>
    </form>
  </main>
</template>
