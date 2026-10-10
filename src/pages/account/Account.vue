<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuth } from '@ulabase/kit-vue';
import Alert from '../../ui/alert/Alert.vue';
import './Account.css';

const auth = useAuth();

// Profile
const firstName = ref('');
const lastName = ref('');
const profileLoading = ref(true);
const profileSaving = ref(false);
const profileSaved = ref(false);
const profileError = ref<string | null>(null);
const profileDirty = ref(false);

// Password
const currentPassword = ref('');
const newPassword = ref('');
const passwordSaving = ref(false);
const passwordSaved = ref(false);
const passwordError = ref<string | null>(null);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);

onMounted(() => {
  auth.checkSession().then(user => {
    if (user) {
      firstName.value = user.profile?.name ?? '';
      lastName.value = user.profile?.surname ?? '';
    }
    profileLoading.value = false;
  });
});

function onProfileInput(): void {
  profileDirty.value = true;
  profileSaved.value = false;
}

async function saveProfile(): Promise<void> {
  if (profileLoading.value || !firstName.value || !lastName.value) return;

  profileSaving.value = true;
  profileError.value = null;
  profileSaved.value = false;
  try {
    await auth.updateProfile({ firstName: firstName.value, lastName: lastName.value });
    profileSaving.value = false;
    profileSaved.value = true;
    profileDirty.value = false;
  } catch (err: unknown) {
    profileSaving.value = false;
    const e = err as { message?: string };
    profileError.value = e?.message ?? 'Something went wrong. Please try again.';
  }
}

async function changePassword(): Promise<void> {
  if (!newPassword.value || newPassword.value.length < 8) return;

  passwordSaving.value = true;
  passwordError.value = null;
  passwordSaved.value = false;
  try {
    await auth.changePassword(currentPassword.value, newPassword.value);
    passwordSaving.value = false;
    passwordSaved.value = true;
    currentPassword.value = '';
    newPassword.value = '';
  } catch (err: unknown) {
    passwordSaving.value = false;
    const e = err as { message?: string };
    passwordError.value = e?.message ?? 'Something went wrong. Please try again.';
  }
}
</script>

<template>
  <section class="card">
    <h2>Profile</h2>

    <Alert v-if="profileSaved" type="success" @close="profileSaved = false">Profile updated!</Alert>
    <Alert v-if="profileError" type="error" @close="profileError = null">{{ profileError }}</Alert>

    <form novalidate class="account-form" @submit.prevent="saveProfile">
      <div class="form-row">
        <div class="form-field">
          <label for="first-name">First name</label>
          <input
            id="first-name"
            v-model="firstName"
            type="text"
            :disabled="profileLoading"
            @input="onProfileInput"
          />
        </div>
        <div class="form-field">
          <label for="last-name">Last name</label>
          <input
            id="last-name"
            v-model="lastName"
            type="text"
            :disabled="profileLoading"
            @input="onProfileInput"
          />
        </div>
      </div>
      <div class="form-field">
        <label>Email</label>
        <input type="email" :value="auth.user.value?._id ?? ''" disabled />
      </div>
      <button
        type="submit"
        class="btn-primary"
        :disabled="profileLoading || !profileDirty || profileSaving"
      >
        {{ profileSaving ? 'Saving…' : 'Save changes' }}
      </button>
    </form>
  </section>

  <section class="card">
    <h2>Change password</h2>

    <Alert v-if="passwordSaved" type="success" @close="passwordSaved = false">Password changed!</Alert>
    <Alert v-if="passwordError" type="error" @close="passwordError = null">{{ passwordError }}</Alert>

    <form novalidate class="account-form" @submit.prevent="changePassword">
      <div class="form-field">
        <label for="current-password">Current password</label>
        <div class="password-field">
          <input
            id="current-password"
            v-model="currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            autocomplete="new-password"
            @input="passwordSaved = false"
          />
          <button
            type="button"
            class="btn-toggle-password"
            @click="showCurrentPassword = !showCurrentPassword"
          >
            {{ showCurrentPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>
      <div class="form-field">
        <label for="new-password">New password</label>
        <div class="password-field">
          <input
            id="new-password"
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            @input="passwordSaved = false"
          />
          <button type="button" class="btn-toggle-password" @click="showNewPassword = !showNewPassword">
            {{ showNewPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>
      <button
        type="submit"
        class="btn-primary"
        :disabled="!newPassword || newPassword.length < 8 || passwordSaving"
      >
        {{ passwordSaving ? 'Changing…' : 'Change password' }}
      </button>
    </form>
  </section>
</template>
