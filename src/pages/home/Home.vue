<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import { environment } from '../../environments/environment';
import './Home.css';

interface StarterFeature {
  name: string;
  description: string;
  enabled: boolean;
  target?: 'team' | 'account';
}

const auth = useAuth();
const features = environment.features;

const demoData = ref<unknown[] | null>(null);
const demoError = ref<string | null>(null);
const demoLoading = ref(false);

async function fetchDemo(): Promise<void> {
  demoLoading.value = true;
  demoError.value = null;
  demoData.value = null;
  try {
    const res = await auth.api('/demo');
    const json = await res.json();
    demoData.value = Array.isArray(json) ? json : [];
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    demoError.value = e.message ?? `HTTP ${e.status ?? '?'}`;
  } finally {
    demoLoading.value = false;
  }
}

const capabilities: StarterFeature[] = [
  {
    name: 'Email sign-up',
    description: 'Registration with an email verification link.',
    enabled: features.emailRegistration,
  },
  {
    name: 'Social login',
    description: `OAuth sign-in via ${features.oauthProviders.join(', ') || 'your provider'}.`,
    enabled: features.oauthLogin,
  },
  {
    name: 'Password reset',
    description: 'Forgot-password email and a reset form.',
    enabled: features.passwordReset,
  },
  {
    name: 'Team invitations',
    description: 'Invite by email — new and existing users both handled.',
    enabled: features.teamInvitations,
    target: 'team',
  },
  {
    name: 'Team management',
    description: 'Members, roles, team switching and settings.',
    enabled: true,
    target: 'team',
  },
  {
    name: 'Account & profile',
    description: 'Update your name and change your password.',
    enabled: true,
    target: 'account',
  },
];

function routeFor(target: 'team' | 'account'): string {
  if (target === 'account') return '/account';
  const active = auth.teams.value.find(t => t.active);
  return active ? `/teams/${active.id.$oid}` : '/teams';
}

const firstName = computed(() => auth.user.value?.profile?.name?.trim() ?? '');
</script>

<template>
  <section class="card hero">
    <p class="eyebrow">Ulabase Starter</p>
    <h1>{{ firstName ? `Welcome, ${firstName}.` : 'Welcome.' }}</h1>
    <p class="hero-pitch">
      Sign-up, login, email verification, password reset, invitations and team
      management are already built and wired up. Now make it yours.
    </p>
  </section>

  <section class="card">
    <div class="card-header">
      <h2>What's already working</h2>
    </div>

    <ul class="feature-grid">
      <li
        v-for="feature in capabilities"
        :key="feature.name"
        :class="['feature', { 'feature-off': !feature.enabled }]"
      >
        <div class="feature-head">
          <RouterLink v-if="feature.target" :to="routeFor(feature.target)" class="feature-name">
            {{ feature.name }}
          </RouterLink>
          <span v-else class="feature-name">{{ feature.name }}</span>
          <span class="badge">{{ feature.enabled ? 'on' : 'off' }}</span>
        </div>
        <p class="muted">{{ feature.description }}</p>
      </li>
    </ul>

    <p class="muted feature-note">
      Toggle these in <code>src/environments/environment.ts</code> to match the
      Features settings of your Ulabase service.
    </p>
  </section>

  <section class="card">
    <div class="card-header">
      <h2>Make it yours</h2>
    </div>

    <ol class="steps">
      <li class="step step-done">
        <span class="step-mark" aria-hidden="true">&#10003;</span>
        <div class="step-body">
          <span class="step-title">Point the app at your Ulabase service</span>
          <p class="muted">
            Done — you're signed in. Configured in
            <code>src/environments/environment.ts</code>.
          </p>
        </div>
      </li>

      <li class="step">
        <span class="step-mark" aria-hidden="true">2</span>
        <div class="step-body">
          <span class="step-title">Make it yours visually</span>
          <p class="muted">
            Either tweak the default skin — the tokens and skin classes in
            <code>src/styles.css</code> — or delete that skin entirely and adopt
            Vuetify, Tailwind, PrimeVue or your own, following the swap map in
            <code>NOTES.md</code>.
          </p>
        </div>
      </li>

      <li class="step">
        <span class="step-mark" aria-hidden="true">3</span>
        <div class="step-body">
          <span class="step-title">Design your navigation and menu</span>
          <p class="muted">
            The app frame lives in <code>src/pages/shell/</code> — the header
            has a marked slot for your section links.
          </p>
        </div>
      </li>

      <li class="step">
        <span class="step-mark" aria-hidden="true">4</span>
        <div class="step-body">
          <span class="step-title">Replace this page</span>
          <p class="muted">
            Swap <code>src/pages/home/</code> for your app's landing content.
          </p>
        </div>
      </li>

      <li class="step">
        <span class="step-mark" aria-hidden="true">5</span>
        <div class="step-body">
          <span class="step-title">Build your first feature screen</span>
          <p class="muted">
            Add the component under <code>src/pages/</code> and register its
            route inside the authenticated shell in <code>src/routes.ts</code>.
          </p>
        </div>
      </li>
    </ol>
  </section>

  <section class="card">
    <div class="card-header">
      <h2>Fetch your data</h2>
    </div>

    <p class="muted">
      The kit provides <code>auth.api()</code> — an authenticated <code>fetch</code> wrapper
      that attaches the bearer token and handles errors. Here is how to use it.
    </p>

    <h3>1. Create the <code>demo</code> collection</h3>
    <p class="muted">
      In your Ulabase dashboard, create a collection called <code>demo</code>
      and add a permission so the signed-in user can read it:
    </p>
    <pre class="code-block">path(/demo) and method(GET)</pre>

    <h3>2. Fetch from your component</h3>
    <!-- v-pre: the sample's own {{ }} must reach the page as text, not be evaluated. -->
    <pre class="code-block" v-pre>&lt;script setup lang="ts"&gt;
import { onMounted, ref } from 'vue';
import { useAuth } from '@ulabase/kit-vue';

const auth = useAuth();
const items = ref([]);

onMounted(async () =&gt; {
  const res = await auth.api('/demo');
  const json = await res.json();
  items.value = Array.isArray(json) ? json : [];
});
&lt;/script&gt;

&lt;template&gt;
  &lt;pre&gt;{{ JSON.stringify(items, null, 2) }}&lt;/pre&gt;
&lt;/template&gt;</pre>

    <h3>3. Try it now</h3>
    <p class="muted">
      Press the button to fetch <code>/demo</code> from your service.
    </p>
    <button class="btn btn-primary" :disabled="demoLoading" @click="fetchDemo">
      {{ demoLoading ? 'Loading…' : 'Fetch /demo' }}
    </button>

    <p v-if="demoError" class="demo-error">{{ demoError }}</p>
    <pre v-if="demoData" class="code-block">{{ JSON.stringify(demoData, null, 2) }}</pre>
  </section>
</template>
