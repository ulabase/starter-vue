<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import type { TeamMembership } from '@ulabase/kit-vue';
import './Teams.css';

const auth = useAuth();
const router = useRouter();
const loading = ref(true);
const switchingTo = ref<string | null>(null);

onMounted(() => {
  auth.loadTeams().then(
    () => (loading.value = false),
    () => (loading.value = false)
  );
});

async function openTeam(team: TeamMembership): Promise<void> {
  if (!team.active) {
    switchingTo.value = team.id.$oid;
    await auth.switchTeam(team.id);
    switchingTo.value = null;
  }
  await router.push(`/teams/${team.id.$oid}`);
}
</script>

<template>
  <section class="card">
    <div class="card-header">
      <h2>Your teams</h2>
      <RouterLink to="/teams/new" class="btn-secondary">+ New team</RouterLink>
    </div>

    <p v-if="loading" class="muted">Loading teams…</p>
    <p v-else-if="auth.teams.value.length === 0" class="muted">You're not part of any team yet.</p>
    <ul v-else class="team-list">
      <li v-for="team in auth.teams.value" :key="team.id.$oid">
        <div :class="['team-row', { active: team.active }]">
          <a :href="`/teams/${team.id.$oid}`" class="team-link" @click.prevent="openTeam(team)">
            <span class="team-name">{{ team.name || team.id.$oid }}</span>
            <span v-if="team.description" class="team-desc">{{ team.description }}</span>
            <span class="team-role">{{ team.role }}</span>
          </a>
          <span v-if="team.active" class="team-badge">current</span>
          <span v-else-if="switchingTo === team.id.$oid" class="muted">Switching…</span>
        </div>
      </li>
    </ul>
  </section>
</template>
