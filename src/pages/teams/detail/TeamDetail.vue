<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuth } from '@ulabase/kit-vue';
import type { TeamMembership, TeamMember, PendingInvitation } from '@ulabase/kit-vue';
import Alert from '../../../ui/alert/Alert.vue';
import './TeamDetail.css';

const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

const auth = useAuth();
const router = useRouter();
const route = useRoute();

const team = ref<TeamMembership | undefined>(undefined);
const isOwner = computed(() => team.value?.role === 'owner');

// Members
const members = ref<TeamMember[]>([]);
const membersLoading = ref(true);
const memberActionPending = ref<string | null>(null);
const removingMemberEmail = ref<string | null>(null);

// Invitations
const invitations = ref<PendingInvitation[]>([]);
const invitationsLoading = ref(true);
const resendingEmail = ref<string | null>(null);
const resendSuccessEmail = ref<string | null>(null);
const resendCooldowns = ref<Record<string, number>>({});
const now = ref(Date.now());

// Invite form
const inviteEmail = ref('');
const inviteRole = ref<'owner' | 'member'>('member');
const inviteSending = ref(false);
const inviteError = ref<string | null>(null);
const inviteSent = ref(false);

// Team settings
const teamName = ref('');
const teamDescription = ref('');
const teamSaving = ref(false);
const teamSaved = ref(false);
const teamError = ref<string | null>(null);
const teamDirty = ref(false);

// Delete
const deleteConfirming = ref(false);
const deleting = ref(false);
const deleteError = ref<string | null>(null);

let interval: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  interval = setInterval(() => (now.value = Date.now()), 30_000);
});
onUnmounted(() => clearInterval(interval));

function load(teamId: string): void {
  auth.loadTeams().then(teams => {
    const found = teams.find(t => t.id.$oid === teamId);
    team.value = found;
    if (found) {
      teamName.value = found.name ?? '';
      teamDescription.value = found.description ?? '';
    }
  });
  membersLoading.value = true;
  auth.listTeamMembers().then(
    m => {
      members.value = m;
      membersLoading.value = false;
    },
    () => (membersLoading.value = false)
  );
  invitationsLoading.value = true;
  auth.listInvitations().then(
    inv => {
      invitations.value = inv;
      invitationsLoading.value = false;
    },
    () => (invitationsLoading.value = false)
  );
}

// The same component instance is reused when only `:id` changes, so the data
// is reloaded on the param rather than once on mount.
watch(
  () => route.params.id,
  id => {
    if (typeof id === 'string' && id) load(id);
  },
  { immediate: true }
);

function canResend(email: string): boolean {
  const since = resendCooldowns.value[email];
  if (!since) return true;
  return now.value - since >= RESEND_COOLDOWN_MS;
}

function resendCooldownLeft(email: string): string {
  const since = resendCooldowns.value[email];
  if (!since) return '';
  const remaining = RESEND_COOLDOWN_MS - (now.value - since);
  if (remaining <= 0) return '';
  const minutes = Math.ceil(remaining / 60000);
  return `${minutes}m`;
}

async function sendInvite(): Promise<void> {
  if (!inviteEmail.value || !inviteEmail.value.includes('@')) return;

  inviteSending.value = true;
  inviteError.value = null;
  try {
    await auth.invite(inviteEmail.value, inviteRole.value);
    inviteSending.value = false;
    inviteSent.value = true;
    inviteEmail.value = '';
    inviteRole.value = 'member';
  } catch (err: unknown) {
    inviteSending.value = false;
    const e = err as { status?: number; message?: string };
    inviteError.value =
      e?.status === 409
        ? 'This person is already a member of your team.'
        : (e?.message ?? 'Something went wrong. Please try again.');
  }
}

async function removeMember(member: TeamMember): Promise<void> {
  memberActionPending.value = member.email;
  removingMemberEmail.value = null;
  try {
    await auth.removeMember(member.email);
    members.value = members.value.filter(m => m.email !== member.email);
  } catch {
    // ignore
  }
  memberActionPending.value = null;
}

async function resendInvite(invite: PendingInvitation): Promise<void> {
  resendingEmail.value = invite.email;
  resendSuccessEmail.value = null;
  try {
    await auth.resendInvite(invite.email);
    const at = Date.now();
    resendingEmail.value = null;
    resendSuccessEmail.value = invite.email;
    resendCooldowns.value = { ...resendCooldowns.value, [invite.email]: at };
    now.value = at;
  } catch {
    resendingEmail.value = null;
  }
}

async function changeRole(member: TeamMember, role: 'owner' | 'member'): Promise<void> {
  if (member.role === role) return;
  memberActionPending.value = member.email;
  try {
    await auth.updateMemberRole(member.email, role);
    members.value = members.value.map(m => (m.email === member.email ? { ...m, role } : m));
  } catch {
    // ignore
  }
  memberActionPending.value = null;
}

async function onRoleChange(member: TeamMember, event: Event): Promise<void> {
  const select = event.target as HTMLSelectElement;
  await changeRole(member, select.value as 'owner' | 'member');
  // `:value` binds one way: if the change was refused, put the select back on
  // the role the member still has.
  select.value = members.value.find(m => m.email === member.email)?.role ?? member.role;
}

function onTeamInput(): void {
  teamDirty.value = true;
  teamSaved.value = false;
}

async function saveTeam(): Promise<void> {
  if (!team.value) return;
  teamSaving.value = true;
  teamError.value = null;
  teamSaved.value = false;
  try {
    await auth.updateTeam({ name: teamName.value, description: teamDescription.value });
    teamSaving.value = false;
    teamSaved.value = true;
    teamDirty.value = false;
  } catch (err: unknown) {
    teamSaving.value = false;
    const e = err as { message?: string };
    teamError.value = e?.message ?? 'Something went wrong. Please try again.';
  }
}

async function deleteTeam(): Promise<void> {
  if (!team.value) return;
  deleting.value = true;
  deleteError.value = null;
  try {
    await auth.deleteTeam();
    const remaining = await auth.loadTeams();
    if (remaining.length > 0 && !remaining.some(t => t.active)) {
      await auth.switchTeam(remaining[0].id);
    }
    await router.push('/teams');
  } catch (err: unknown) {
    deleting.value = false;
    const e = err as { message?: string };
    deleteError.value = e?.message ?? 'Could not delete the team.';
  }
}

function cancelDelete(): void {
  deleteConfirming.value = false;
  deleteError.value = null;
}

function formatDate(date: string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <section class="card">
    <RouterLink to="/teams" class="back-link">&larr; Back to teams</RouterLink>
    <h2>{{ team?.name || team?.id?.$oid }}</h2>
    <p v-if="team?.description" class="muted">{{ team.description }}</p>
  </section>

  <section class="card">
    <h2>Members</h2>
    <p v-if="membersLoading" class="muted">Loading members…</p>
    <p v-else-if="members.length === 0" class="muted">No members yet.</p>
    <ul v-else class="member-list">
      <li v-for="member in members" :key="member.email" class="member-row">
        <div class="member-info">
          <span class="member-name">{{ member.name || member.email }}</span>
          <span class="member-email">{{ member.email }}</span>
        </div>
        <div v-if="isOwner" class="member-actions">
          <template v-if="member.email !== auth.user.value?._id">
            <select
              class="role-select"
              :value="member.role"
              :disabled="memberActionPending === member.email"
              @change="onRoleChange(member, $event)"
            >
              <option value="member">Member</option>
              <option value="owner">Owner</option>
            </select>
            <template v-if="removingMemberEmail === member.email">
              <span class="muted">Remove?</span>
              <button
                type="button"
                class="btn-danger-text"
                :disabled="memberActionPending === member.email"
                @click="removeMember(member)"
              >
                Yes
              </button>
              <button type="button" class="btn-secondary" @click="removingMemberEmail = null">No</button>
            </template>
            <button
              v-else
              type="button"
              class="btn-danger-text"
              :disabled="memberActionPending === member.email"
              @click="removingMemberEmail = member.email"
            >
              Remove
            </button>
          </template>
          <span v-else class="team-role">{{ member.role }}</span>
        </div>
        <span v-else class="team-role">{{ member.role }}</span>
      </li>
    </ul>
  </section>

  <template v-if="isOwner">
    <section class="card">
      <h2>Invite a team member</h2>
      <Alert v-if="inviteSent" type="success" @close="inviteSent = false">Invitation sent!</Alert>
      <Alert v-if="inviteError" type="error" @close="inviteError = null">{{ inviteError }}</Alert>
      <form novalidate class="invite-form" @submit.prevent="sendInvite">
        <div class="form-row">
          <div class="form-field">
            <label for="invite-email">Email</label>
            <input
              id="invite-email"
              v-model="inviteEmail"
              type="email"
              placeholder="colleague@example.com"
              @input="inviteSent = false"
            />
          </div>
          <div class="form-field form-field-sm">
            <label for="invite-role">Role</label>
            <select id="invite-role" v-model="inviteRole" @change="inviteSent = false">
              <option value="member">Member</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          class="btn-primary"
          :disabled="inviteSending || !inviteEmail || !inviteEmail.includes('@')"
        >
          {{ inviteSending ? 'Sending…' : 'Send invite' }}
        </button>
      </form>
    </section>

    <section v-if="invitationsLoading" class="card">
      <h2>Pending invitations</h2>
      <p class="muted">Loading invitations…</p>
    </section>
    <section v-else-if="invitations.length > 0" class="card">
      <h2>Pending invitations</h2>
      <Alert v-if="resendSuccessEmail" type="success" @close="resendSuccessEmail = null">
        Invitation resent to {{ resendSuccessEmail }}!
      </Alert>
      <ul class="member-list">
        <li
          v-for="invite in invitations"
          :key="invite.email"
          :class="['member-row', { expired: invite.expired }]"
        >
          <div class="member-info">
            <span class="member-name">{{ invite.email }}</span>
            <span class="member-email">{{ invite.role }}<template v-if="invite.createdAt"> · invited {{ formatDate(invite.createdAt) }}</template><template v-if="invite.expired"> · expired</template></span>
          </div>
          <button
            type="button"
            class="btn-secondary"
            :disabled="resendingEmail === invite.email || !canResend(invite.email)"
            @click="resendInvite(invite)"
          >
            {{
              resendingEmail === invite.email
                ? 'Sending…'
                : !canResend(invite.email)
                  ? `Wait ${resendCooldownLeft(invite.email)}`
                  : 'Resend'
            }}
          </button>
        </li>
      </ul>
    </section>

    <section class="card">
      <h2>Team settings</h2>
      <Alert v-if="teamSaved" type="success" @close="teamSaved = false">Team updated!</Alert>
      <Alert v-if="teamError" type="error" @close="teamError = null">{{ teamError }}</Alert>
      <form novalidate class="invite-form" @submit.prevent="saveTeam">
        <div class="form-field">
          <label for="team-name">Team name</label>
          <input
            id="team-name"
            v-model="teamName"
            type="text"
            autocomplete="off"
            @input="onTeamInput"
          />
        </div>
        <div class="form-field">
          <label for="team-description">Description</label>
          <textarea
            id="team-description"
            v-model="teamDescription"
            rows="3"
            placeholder="Optional"
            autocomplete="off"
            @input="onTeamInput"
          ></textarea>
        </div>
        <button type="submit" class="btn-primary" :disabled="teamSaving || !teamDirty">
          {{ teamSaving ? 'Saving…' : 'Save changes' }}
        </button>
      </form>

      <div class="danger-zone">
        <div class="danger-zone-text">
          <strong>Delete this team</strong>
          <p class="muted">Only possible while no other members remain.</p>
        </div>
        <button v-if="!deleteConfirming" type="button" class="btn-danger" @click="deleteConfirming = true">
          Delete team
        </button>
        <div v-else class="delete-confirm" role="alertdialog" aria-label="Confirm delete team">
          <span>Are you sure?</span>
          <button type="button" class="btn-danger" :disabled="deleting" @click="deleteTeam">
            {{ deleting ? 'Deleting…' : 'Yes, delete' }}
          </button>
          <button type="button" class="btn-secondary" @click="cancelDelete">Cancel</button>
        </div>
        <Alert v-if="deleteError" type="error" @close="deleteError = null">{{ deleteError }}</Alert>
      </div>
    </section>
  </template>
</template>
