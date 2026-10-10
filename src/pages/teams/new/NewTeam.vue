<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import Alert from '../../../ui/alert/Alert.vue';
import './NewTeam.css';

const auth = useAuth();
const router = useRouter();

const teamName = ref('');
const saving = ref(false);
const error = ref<string | null>(null);

async function createTeam(): Promise<void> {
  if (!teamName.value) return;

  saving.value = true;
  error.value = null;
  try {
    await auth.createTeam(teamName.value);
    await router.push('/teams');
  } catch (err: unknown) {
    saving.value = false;
    const e = err as { message?: string };
    error.value = e?.message ?? 'Something went wrong. Please try again.';
  }
}
</script>

<template>
  <section class="card">
    <RouterLink to="/teams" class="back-link">&larr; Back to teams</RouterLink>
    <h2>Create a new team</h2>

    <Alert v-if="error" type="error" @close="error = null">{{ error }}</Alert>

    <form novalidate class="account-form" @submit.prevent="createTeam">
      <div class="form-field">
        <label for="team-name">Team name</label>
        <input id="team-name" v-model="teamName" type="text" placeholder="Acme Corp" />
      </div>
      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? 'Creating…' : 'Create team' }}
      </button>
    </form>
  </section>
</template>
