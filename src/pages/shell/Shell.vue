<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import { isJustSignedUp, setJustSignedUp } from '../../just-signed-up';
import './Shell.css';

const STORAGE_KEY = 'rh-theme';

function useTheme() {
  const dark = ref(typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'dark');

  watch(dark, value => document.documentElement.classList.toggle('dark', value), {
    immediate: true,
  });

  function toggle(): void {
    dark.value = !dark.value;
    localStorage.setItem(STORAGE_KEY, dark.value ? 'dark' : 'light');
  }

  return { dark, toggle };
}

const auth = useAuth();
const router = useRouter();
const route = useRoute();
const theme = useTheme();

const justSignedUp = ref(isJustSignedUp());
setJustSignedUp(false);

const menuOpen = ref(false);

/** True while the router is resolving a route — drives the top progress bar.
 *  Lazy-loaded routes fetch a chunk, so without this the app looks frozen. */
const navigating = ref(false);
const stopBefore = router.beforeEach(() => {
  navigating.value = true;
});
const stopAfter = router.afterEach(() => {
  navigating.value = false;
});
const stopError = router.onError(() => {
  navigating.value = false;
});

const avatarBtn = ref<HTMLButtonElement | null>(null);
const menu = ref<HTMLDivElement | null>(null);
const dropdown = ref<HTMLDivElement | null>(null);

const initials = computed((): string => {
  const user = auth.user.value;
  if (!user) return '?';
  const first = user.profile?.name?.charAt(0) ?? '';
  const last = user.profile?.surname?.charAt(0) ?? '';
  const fallback = user._id?.charAt(0) ?? '?';
  return (first + last || fallback).toUpperCase();
});

const displayName = computed((): string => {
  const user = auth.user.value;
  if (!user) return '';
  const fn = user.profile?.name;
  const ln = user.profile?.surname;
  if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
  return user._id;
});

const email = computed((): string => auth.user.value?._id ?? '');

const activeTeamName = computed((): string => {
  const active = auth.teams.value.find(t => t.active);
  return active?.name ?? '';
});

/** NavLink semantics: a section link stays lit on its sub-pages too. */
function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`);
}

async function toggleMenu(): Promise<void> {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) {
    await nextTick();
    dropdown.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }
}

function closeMenu(): void {
  menuOpen.value = false;
  avatarBtn.value?.focus();
}

function onMenuKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu();
  }
}

function onDocumentClick(event: MouseEvent): void {
  if (!menuOpen.value) return;
  if (menu.value && !menu.value.contains(event.target as Node)) {
    closeMenu();
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick));
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
  stopBefore();
  stopAfter();
  stopError();
});

async function logout(): Promise<void> {
  closeMenu();
  await auth.logout();
  await router.push('/auth/login');
}
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>

  <div class="layout">
    <div v-if="navigating" class="nav-progress" role="progressbar" aria-label="Loading page"></div>

    <header class="header">
      <RouterLink to="/" class="logo">Ulabase</RouterLink>

      <nav class="nav" aria-label="Main">
        <RouterLink to="/home" :class="['nav-link', { active: isActive('/home') }]">Home</RouterLink>
        <RouterLink to="/teams" :class="['nav-link', { active: isActive('/teams') }]">Teams</RouterLink>
        <!-- Your section links go here. -->
      </nav>

      <div class="header-actions">
        <button
          type="button"
          class="btn-icon"
          :aria-label="theme.dark.value ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="theme.toggle"
        >
          <svg v-if="theme.dark.value" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>

        <div ref="menu" class="user-menu">
          <button
            ref="avatarBtn"
            type="button"
            class="avatar-btn"
            :aria-expanded="menuOpen"
            aria-haspopup="menu"
            aria-label="Account menu"
            @click="toggleMenu"
          >
            {{ initials }}
          </button>

          <div
            v-if="menuOpen"
            ref="dropdown"
            class="dropdown"
            role="menu"
            @click.stop
            @keydown="onMenuKeydown"
          >
            <div class="dropdown-header">
              <span class="dropdown-name">{{ displayName }}</span>
              <span v-if="email && email !== displayName" class="dropdown-email">{{ email }}</span>
              <span v-if="activeTeamName" class="dropdown-team">Team: {{ activeTeamName }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <RouterLink to="/account" class="dropdown-item" role="menuitem" @click="closeMenu">Account</RouterLink>
            <div class="dropdown-divider"></div>
            <button type="button" class="dropdown-item dropdown-item-danger" role="menuitem" @click="logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <div v-if="justSignedUp" class="welcome-banner">
      <p>Welcome aboard — your account is ready.</p>
      <button type="button" class="btn-dismiss" @click="justSignedUp = false">&#10005;</button>
    </div>

    <main id="main" class="main">
      <RouterView />
    </main>
  </div>
</template>
