import { createApp, watch } from 'vue';
import { createRouter, createWebHistory, type NavigationGuardNext } from 'vue-router';
import { createRhAuth, isValidApiBaseUrl, setToken, scheduleRefresh } from '@ulabase/kit-vue';
import App from './App.vue';
import ConfigPage from './ConfigPage.vue';
import { consentsOnError } from './consents-signal';
import { environment } from './environments/environment';
import { setJustSignedUp } from './just-signed-up';
import { routes } from './routes';
import './styles.css';

function consumeFragmentToken(): void {
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      setToken(accessToken);
      scheduleRefresh({ apiBaseUrl: environment.apiUrl });
    }
  }

  const search = new URLSearchParams(window.location.search);
  const isSignup = search.get('flow') === 'signup';
  if (isSignup) {
    setJustSignedUp(true);
    search.delete('flow');
  }

  if (!hash && !isSignup) return;

  const query = search.toString();
  history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));
}

const apiConfigured = isValidApiBaseUrl(environment.apiUrl);

if (!apiConfigured) {
  console.error(
    `[app] apiUrl must point to a Ulabase service (an https:// URL), got "${environment.apiUrl}". ` +
      'Set it in src/environments/environment.ts.'
  );
  // No router and no auth store: with no service to talk to there is nothing
  // to route to, and the store would start a session check against nowhere.
  createApp(ConfigPage, { apiUrl: environment.apiUrl }).mount('#app');
} else {
  // Before createRhAuth on purpose: the store checks the session the moment it
  // is created, so a token arriving in the URL fragment (verification, OAuth)
  // must already be stored by then, or the first check finds no session.
  consumeFragmentToken();

  const rhAuth = createRhAuth({ apiBaseUrl: environment.apiUrl, onError: consentsOnError });
  const router = createRouter({ history: createWebHistory(), routes });

  // The kit's guards ignore `next` and return their verdict, so a no-op stands
  // in for it. One global hook, keyed on `meta.guard`, runs on every navigation,
  // children of the shell included; routes without the meta stay unguarded.
  const noNext: NavigationGuardNext = () => undefined;
  router.beforeEach((to, from) => {
    if (to.meta.guard === 'auth') return rhAuth.authGuard.call(undefined, to, from, noNext);
    if (to.meta.guard === 'public') return rhAuth.publicGuard.call(undefined, to, from, noNext);
    return true;
  });

  // Vue Router checks the session only on navigation: when it ends while a signed-in page is open
  // (logout, an expired or refused token), go to the login page now rather than at the next click.
  watch(rhAuth.store.user, (user, previous) => {
    if (user || !previous) return;
    if (router.currentRoute.value.matched.some(r => r.meta.guard === 'auth')) void router.push('/auth/login');
  });

  createApp(App).use(rhAuth).use(router).mount('#app');
}
