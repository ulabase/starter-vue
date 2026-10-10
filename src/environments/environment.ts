export const environment = {
  // Your free Ulabase service, e.g.
  // 'https://<srvid>.ulabase.app'. Left empty on purpose:
  // a real id committed here is the id every clone of this starter would talk
  // to, and empty shows the "configure your service" screen instead.
  //
  // To keep your own edit out of `git status`:
  //   git update-index --assume-unchanged src/environments/environment.ts
  apiUrl: '',
  features: {
    emailRegistration: true,
    passwordReset: true,
    oauthLogin: false, // Google sign-in: off until you create its OAuth client (README, "Google sign-in")
    oauthProviders: ['google'] as const,
    teamInvitations: true,
  },
};
