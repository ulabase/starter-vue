<script setup lang="ts">
/* ─────────────────────────────────────────────────────────────────────────
   The public first page: what this app is, the Ulabase service it runs on,
   how to connect a coding agent to the Ulabase docs, and how to make the app
   yours. Signed-in users never see it: "/" sends them to the app.
   Replace it with your own first page.
   ───────────────────────────────────────────────────────────────────────── */
import { computed, onMounted, ref, watchEffect } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { getToken, useAuth } from '@ulabase/kit-vue';
import { environment } from '../../environments/environment';
// the steps, the code block and the pitch come from the home, the logo from the frame
import '../home/Home.css';
import '../shell/Shell.css';
import './Welcome.css';

const DOCS_MCP = 'https://d0c5a1.ulabase.app/mcp';

/** How each agent adds the docs MCP server. */
const AGENTS = [
  { id: 'claude', name: 'Claude Code', where: 'In the folder of the app:', code: `claude mcp add --transport http ulabase-docs ${DOCS_MCP}` },
  { id: 'cursor', name: 'Cursor', where: 'In .cursor/mcp.json:', code: `{\n  "mcpServers": {\n    "ulabase-docs": { "url": "${DOCS_MCP}" }\n  }\n}` },
  { id: 'vscode', name: 'VS Code', where: 'In .vscode/mcp.json:', code: `{\n  "servers": {\n    "ulabase-docs": { "type": "http", "url": "${DOCS_MCP}" }\n  }\n}` },
  { id: 'other', name: 'Other agents', where: 'An MCP server over HTTP, at the address:', code: DOCS_MCP },
];

/** The service id is the first label of its address: https://c0ffee.ulabase.app. */
const serviceId = (() => {
  try {
    return new URL(environment.apiUrl).hostname.split('.')[0];
  } catch {
    return '';
  }
})();

const auth = useAuth();
const router = useRouter();
const agent = ref(AGENTS[0].id);
const shown = computed(() => AGENTS.find(a => a.id === agent.value) ?? AGENTS[0]);
const status = ref<'checking' | 'answering' | 'not answering'>('checking');
const { emailRegistration, oauthLogin } = environment.features;
const canSignUp = emailRegistration || oauthLogin;

// a signed-in user goes on to the app. A token is enough to try: a password reset or an accepted
// invitation lands here signed in before the store has read the session, and the guard of /home
// reads it
const signedIn = computed(() => !!getToken() || (!auth.initializing.value && auth.isAuthenticated.value));
watchEffect(() => {
  if (signedIn.value) void router.replace('/home');
});

onMounted(() => {
  // the service answers /ping to anyone: a plain way to show the connection is live
  fetch(`${environment.apiUrl}/ping`).then(
    res => (status.value = res.ok ? 'answering' : 'not answering'),
    () => (status.value = 'not answering'),
  );
});
</script>

<template>
  <div v-if="!signedIn" class="welcome">
    <header class="welcome-header">
      <span class="logo">My app</span>
      <nav class="welcome-nav">
        <RouterLink to="/auth/login" class="btn-secondary">Sign in</RouterLink>
        <RouterLink v-if="canSignUp" to="/auth/signup" class="btn-primary">Sign up</RouterLink>
      </nav>
    </header>

    <main class="welcome-main">
      <section class="welcome-hero">
        <div class="welcome-intro">
          <p class="eyebrow">Ulabase starter · Vue</p>
          <h1>A base app, running on your Ulabase service.</h1>
          <p class="hero-pitch">
            Sign-up, login, email verification, password reset, teams and invitations already work.
            The service behind them is yours, on Ulabase.
          </p>
          <div class="welcome-actions">
            <RouterLink v-if="canSignUp" to="/auth/signup" class="btn-primary">Sign up</RouterLink>
            <RouterLink to="/auth/login" class="btn-secondary">Sign in</RouterLink>
          </div>
        </div>

        <aside class="connection" aria-label="The Ulabase service of this app">
          <div class="connection-head">
            <span class="eyebrow">Connected to Ulabase</span>
            <span class="connection-status" :class="`status-${status.replace(' ', '-')}`">
              {{ status === 'checking' ? 'Checking…' : status === 'answering' ? 'Answering' : 'Not answering' }}
            </span>
          </div>
          <dl class="connection-facts">
            <dt>Service</dt>
            <dd><code>{{ serviceId }}</code></dd>
            <dt>Address</dt>
            <dd><code>{{ environment.apiUrl }}</code></dd>
            <dt>Set in</dt>
            <dd><code>.env.development</code></dd>
          </dl>
          <p class="connection-note">
            This app has no backend code. Accounts, teams and data are on the service, and the app
            calls its API with the Ulabase Kit.
          </p>
          <a href="https://ulabase.com/orgs" target="_blank" rel="noopener">Open the Ulabase console →</a>
        </aside>
      </section>

      <section class="card">
        <h2>What already works</h2>
        <ul class="welcome-grid">
          <li><strong>Email sign-up</strong><span class="muted">Registration with an email verification link.</span></li>
          <li><strong>Google sign-in</strong><span class="muted">When the service has your Google credentials.</span></li>
          <li><strong>Password reset</strong><span class="muted">Forgot-password email and a reset form.</span></li>
          <li><strong>Teams and invitations</strong><span class="muted">Members, roles, switching team, invitations by email.</span></li>
          <li><strong>Account</strong><span class="muted">Name and password.</span></li>
          <li><strong>Your data</strong><span class="muted">Collections and permissions on the service, called with <code>auth.api()</code>.</span></li>
        </ul>
      </section>

      <section class="card">
        <h2>Connect your coding agent to the Ulabase docs</h2>
        <p class="muted">
          Add the docs MCP server to your agent. The agent reads the Ulabase documentation while it
          changes this app. It needs no account and no key.
        </p>
        <div class="agent-tabs" role="tablist" aria-label="Coding agent">
          <button v-for="a in AGENTS" :key="a.id" type="button" role="tab" :aria-selected="a.id === agent"
            :class="{ active: a.id === agent }" @click="agent = a.id">{{ a.name }}</button>
        </div>
        <div role="tabpanel">
          <p class="agent-where">{{ shown.where }}</p>
          <pre class="code-block">{{ shown.code }}</pre>
        </div>
      </section>

      <section class="card">
        <h2>Make it yours</h2>
        <ol class="steps">
          <li class="step step-done">
            <span class="step-mark" aria-hidden="true">&#10003;</span>
            <div class="step-body">
              <span class="step-title">Point the app at your Ulabase service</span>
              <p class="muted">Done: <code>ulabase app new</code> wrote the address in <code>.env.development</code>.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-mark" aria-hidden="true">2</span>
            <div class="step-body">
              <span class="step-title">Connect your coding agent to the Ulabase docs</span>
              <p class="muted">The section above.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-mark" aria-hidden="true">3</span>
            <div class="step-body">
              <span class="step-title">Change the look</span>
              <p class="muted">
                Tweak the tokens in <code>src/styles.css</code>, or remove that skin and use Vuetify,
                Tailwind, PrimeVue or your own, following the map in <code>NOTES.md</code>.
              </p>
            </div>
          </li>
          <li class="step">
            <span class="step-mark" aria-hidden="true">4</span>
            <div class="step-body">
              <span class="step-title">Design your navigation and menu</span>
              <p class="muted">The app frame is in <code>src/pages/shell/</code>: the header has a marked place for your links.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-mark" aria-hidden="true">5</span>
            <div class="step-body">
              <span class="step-title">Replace this page</span>
              <p class="muted">It is <code>src/pages/welcome/</code>: put your app's own first page there.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-mark" aria-hidden="true">6</span>
            <div class="step-body">
              <span class="step-title">Build your first screen</span>
              <p class="muted">Add it under <code>src/pages/</code>, and its route inside the signed-in frame in <code>src/routes.ts</code>.</p>
            </div>
          </li>
        </ol>
      </section>
    </main>

    <footer class="welcome-footer">
      <span>Built with the Ulabase Vue starter.</span>
      <span>
        <a href="https://ulabase.com" target="_blank" rel="noopener">ulabase.com</a> ·
        <a href="https://ulabase.com/docs" target="_blank" rel="noopener">Docs</a> ·
        <a href="https://ulabase.com/orgs" target="_blank" rel="noopener">Console</a>
      </span>
    </footer>
  </div>
</template>
