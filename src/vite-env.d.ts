/// <reference types="vite/client" />

import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Which kit guard the route sits behind: `auth` for the app, `public` for
     * the sign-in pages. Absent means no guard at all, as for
     * `/invitations/accept`. Children inherit it from their parent record.
     */
    guard?: 'auth' | 'public';
  }
}
