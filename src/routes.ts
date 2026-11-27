import type { RouteRecordRaw } from 'vue-router';
import { environment } from './environments/environment';

// Every page is a lazy chunk: `() => import(...)` is Vue Router's code splitting.
const Login = () => import('./pages/auth/login/Login.vue');
const Signup = () => import('./pages/auth/signup/Signup.vue');
const Verify = () => import('./pages/auth/verify/Verify.vue');
const ForgotPassword = () => import('./pages/auth/forgot-password/ForgotPassword.vue');
const ResetPassword = () => import('./pages/auth/reset-password/ResetPassword.vue');
const Accept = () => import('./pages/invitations/accept/Accept.vue');
const Shell = () => import('./pages/shell/Shell.vue');
const Home = () => import('./pages/home/Home.vue');
const Welcome = () => import('./pages/welcome/Welcome.vue');
const Teams = () => import('./pages/teams/Teams.vue');
const NewTeam = () => import('./pages/teams/new/NewTeam.vue');
const TeamDetail = () => import('./pages/teams/detail/TeamDetail.vue');
const Account = () => import('./pages/account/Account.vue');

const { emailRegistration, passwordReset, oauthLogin, teamInvitations } = environment.features;

// `meta.guard` is read by the global `beforeEach` in main.ts: `public` sends a
// signed-in user into the app, `auth` sends a signed-out one to the login page.
export const routes: RouteRecordRaw[] = [
  { path: '/auth/login', component: Login, meta: { guard: 'public' } },
  ...(emailRegistration || oauthLogin
    ? [{ path: '/auth/signup', component: Signup, meta: { guard: 'public' as const } }]
    : []),
  ...(emailRegistration
    ? [{ path: '/auth/verify', component: Verify, meta: { guard: 'public' as const } }]
    : []),
  ...(passwordReset
    ? [
        { path: '/auth/forgot-password', component: ForgotPassword, meta: { guard: 'public' as const } },
        { path: '/auth/reset-password', component: ResetPassword, meta: { guard: 'public' as const } },
      ]
    : []),
  // One page, two paths: the service's invitation email links a new user to
  // /auth/activate and an existing one to /invitations/accept. No guard on
  // either: it must work for signed-out invitees, signed-in users, and people
  // without an account.
  ...(teamInvitations
    ? ['/auth/activate', '/invitations/accept'].map(path => ({ path, component: Accept }))
    : []),
  // The public first page: what the app is and the service it runs on. A signed-in user who
  // lands here goes on to /home. Before the frame below, which has no page of its own at "/".
  { path: '/', component: Welcome },
  {
    path: '/',
    component: Shell,
    meta: { guard: 'auth' },
    children: [
      { path: 'home', component: Home },
      { path: 'teams', component: Teams },
      { path: 'teams/new', component: NewTeam },
      { path: 'teams/:id', component: TeamDetail },
      { path: 'account', component: Account },
    ],
  },
  { path: '/:pathMatch(.*)*', component: Welcome },
];
