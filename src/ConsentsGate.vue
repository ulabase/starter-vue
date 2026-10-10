<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import { consentsBlocked, setBlocked } from './consents-signal';
import './ConsentsGate.css';

/**
 * Replaces the whole app with an acceptance form while the API is answering
 * `451`.
 *
 * It sits at the root, above the router view, and that placement is the point:
 * a blocked user has no session — `/users/me` is refused too — so `authGuard`
 * would bounce them to the login page and they would never reach a screen
 * inside the app. Here there is no guard to get past.
 *
 * The overlay is user experience, not enforcement: remove it with the dev
 * tools and every request still comes back `451`. The rule lives on the server.
 */

const auth = useAuth();
const router = useRouter();
const busy = ref(false);
const error = ref<string | null>(null);
// Two boxes because there are two documents. They gate the button and
// nothing else: the request that follows carries no versions, and the server
// stamps both in one go — see the permission's mergeRequest.
const acceptedTos = ref(false);
const acceptedPp = ref(false);

async function accept(): Promise<void> {
  busy.value = true;
  error.value = null;
  try {
    // The versions and the timestamp are stamped by the permission's
    // mergeRequest — this call states nothing about what is accepted. The
    // user id comes from the token, since the user document is exactly what
    // we cannot read yet.
    await auth.acceptConsents();
    // The token is new and /users/me now answers: reload the session so the
    // app starts with a user and their teams rather than a blank shell.
    await auth.checkSession();
    setBlocked(false);
  } catch {
    error.value = 'We could not record your acceptance. Please try again.';
  } finally {
    busy.value = false;
  }
}

async function signOut(): Promise<void> {
  // Clear the flag too, or the next user to sign in on this tab meets the
  // overlay before making a single request.
  setBlocked(false);
  await auth.logout();
  // Vue Router guards run on navigation, not when the session changes, so the
  // move to the login page is made here rather than left to a guard.
  await router.push('/auth/login');
}
</script>

<template>
  <slot v-if="!consentsBlocked" />
  <div
    v-else
    class="consents-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="consents-title"
  >
    <div class="consents-card">
      <h1 id="consents-title">Before you continue</h1>
      <p>Please review these documents and accept them to use the application.</p>

      <label class="consents-check">
        <input v-model="acceptedTos" type="checkbox" />
        <span>
          I have read and accept the
          <a href="/terms.html" target="_blank" rel="noreferrer">Terms of Service</a>
        </span>
      </label>

      <label class="consents-check">
        <input v-model="acceptedPp" type="checkbox" />
        <span>
          I have read and accept the
          <a href="/privacy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
        </span>
      </label>

      <p v-if="error" class="field-error">{{ error }}</p>
      <button
        type="button"
        class="btn-primary"
        :disabled="busy || !acceptedTos || !acceptedPp"
        @click="accept"
      >
        {{ busy ? 'Saving…' : 'I accept' }}
      </button>
      <button type="button" class="btn-plain" @click="signOut">Sign out</button>
    </div>
  </div>
</template>
