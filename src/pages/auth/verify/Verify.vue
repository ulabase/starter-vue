<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';

const auth = useAuth();
const route = useRoute();

const email = typeof route.query.email === 'string' ? route.query.email : '';
const token = typeof route.query.token === 'string' ? route.query.token : '';
const error = typeof route.query.error === 'string' ? route.query.error : null;
const missingParams = !email || !token;

onMounted(() => {
  if (!missingParams && !error) {
    auth.verify(email, token).then(url => {
      window.location.href = url;
    });
  }
});
</script>

<template>
  <main v-if="missingParams" class="auth-page">
    <div class="auth-card">
      <h1>Invalid link</h1>
      <p>This verification link is missing required information.</p>
      <p class="auth-links"><RouterLink to="/auth/login">Back to log in</RouterLink></p>
    </div>
  </main>

  <main v-else-if="error" class="auth-page">
    <div class="auth-card">
      <h1>Verification failed</h1>
      <p>The verification link is invalid or has expired.</p>
      <p class="auth-links"><RouterLink to="/auth/login">Back to log in</RouterLink></p>
    </div>
  </main>

  <main v-else class="auth-page">
    <div class="auth-card">
      <h1>Verifying your email…</h1>
      <p>Please wait while we verify your email address.</p>
    </div>
  </main>
</template>
