---
type: workflow
title: Adding a New Page
description: Step-by-step guide for creating and registering a new page component in the Ulabase Vue starter application.
tags: [workflow, pages, vue, routing, navigation, components]
sources:
  - id: openwiki-source-eaae96b81373abab97667f4f
    resource: repo://src/environments/environment.ts
  - id: openwiki-source-d4189bbeecb62806cb297b5a
    resource: repo://src/main.ts
  - id: openwiki-source-33c99184282871a56009e7cd
    resource: repo://src/pages/home/Home.vue
  - id: openwiki-source-ee9a644578aeccba70142314
    resource: repo://src/pages/shell/Shell.vue
  - id: openwiki-source-d5c61aa40058a82d210db604
    resource: repo://src/pages/teams/Teams.vue
  - id: openwiki-source-28ff6ab0b2c280a1e7f9575c
    resource: repo://src/routes.ts
generated: { by: "openwiki/0.7.2", at: "2026-10-12T10:21:41.724Z" }
---

# Adding a New Page

This workflow guides you through adding a new page to the Ulabase Vue starter application. The process involves creating a Vue component, registering it in the router, and optionally adding a navigation link.

## 1. Create the Page Component

Create a new directory under `src/pages/` with your page name (in kebab-case), then create the Vue component file inside it.

**Directory structure:**
```
src/pages/
├── your-page-name/
│   ├── YourPage.vue
│   └── YourPage.css  # Optional: component-specific styles
```

**Component template:**
```vue
<script setup lang="ts">
// Import any needed utilities
import { ref, onMounted } from 'vue';
import { useAuth } from '@ulabase/kit-vue';
import './YourPage.css';

const auth = useAuth();
// Your component logic here
</script>

<template>
  <section class="card">
    <h1>Your Page Title</h1>
    <p>Your page content here.</p>
  </section>
</template>
```

**Key points:**
- Use Vue 3 Composition API with `<script setup>`
- Import component-specific CSS if needed
- Use `useAuth()` from `@ulabase/kit-vue` for authentication state
- Follow existing component patterns (see `src/pages/home/Home.vue` for reference)

## 2. Register the Route in `src/routes.ts`

### For Authenticated Pages (Recommended)

Most new pages should be authenticated and added as children of the Shell route. This ensures they inherit the `auth` guard and appear within the app shell layout.

**Step 1:** Add a lazy import at the top of `src/routes.ts`:
```typescript
const YourPage = () => import('./pages/your-page-name/YourPage.vue');
```

**Step 2:** Add the route as a child of the Shell route:
```typescript
{
  path: '/',
  component: Shell,
  meta: { guard: 'auth' },
  children: [
    { path: '', component: Home },
    { path: 'home', component: Home },
    { path: 'teams', component: Teams },
    { path: 'your-page-path', component: YourPage },  // Add here
    // ... other children
  ],
},
```

**Route structure notes:**
- Child paths are relative to the parent (`/`)
- The route will be accessible at `/your-page-path`
- The `auth` guard is inherited from the parent Shell route
- No need to specify `meta.guard` for children

### For Public Pages

If your page should be accessible to unauthenticated users (e.g., a public landing page or help page):

**Step 1:** Add a lazy import:
```typescript
const YourPublicPage = () => import('./pages/your-public-page/YourPublicPage.vue');
```

**Step 2:** Add at the top level with `guard: 'public'`:
```typescript
export const routes: RouteRecordRaw[] = [
  { path: '/auth/login', component: Login, meta: { guard: 'public' } },
  // ... other auth routes
  { path: '/your-public-path', component: YourPublicPage, meta: { guard: 'public' } },
  // ... other routes
];
```

### For Feature-Flag Gated Pages

If your page should only be available when a specific feature flag is enabled:

**Step 1:** Add a lazy import:
```typescript
const YourFeaturePage = () => import('./pages/your-feature-page/YourFeaturePage.vue');
```

**Step 2:** Use conditional spread with the feature flag:
```typescript
const { yourFeatureFlag } = environment.features;

export const routes: RouteRecordRaw[] = [
  // ... other routes
  ...(yourFeatureFlag ? [{ path: '/your-feature', component: YourFeaturePage, meta: { guard: 'public' as const } }] : []),
  // ... other routes
];
```

For authenticated feature-flagged pages, add the conditional spread inside the Shell's children array.

## 3. Add a Navigation Link (Optional)

If your page should appear in the main navigation, add a link in `src/pages/shell/Shell.vue`.

**Step 1:** Locate the navigation section in the template (around line 133-137):
```vue
<nav class="nav" aria-label="Main">
  <RouterLink to="/home" :class="['nav-link', { active: isActive('/home') }]">Home</RouterLink>
  <RouterLink to="/teams" :class="['nav-link', { active: isActive('/teams') }]">Teams</RouterLink>
  <!-- Your section links go here. -->
</nav>
```

**Step 2:** Add your navigation link:
```vue
<nav class="nav" aria-label="Main">
  <RouterLink to="/home" :class="['nav-link', { active: isActive('/home') }]">Home</RouterLink>
  <RouterLink to="/teams" :class="['nav-link', { active: isActive('/teams') }]">Teams</RouterLink>
  <RouterLink to="/your-page-path" :class="['nav-link', { active: isActive('/your-page-path') }]">Your Page</RouterLink>
</nav>
```

**Navigation link behavior:**
- Uses `isActive()` function to highlight the link when active
- `isActive()` checks if the current route path matches or starts with the link path
- This provides proper highlighting for both the exact page and any sub-pages

## 4. Example: Complete Page Addition

Here's a complete example adding a "Settings" page:

**1. Create component:**
```
src/pages/settings/Settings.vue
```

**2. Add to routes.ts:**
```typescript
const Settings = () => import('./pages/settings/Settings.vue');

// In the Shell children array:
children: [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'teams', component: Teams },
  { path: 'settings', component: Settings },  // New page
  { path: 'account', component: Account },
],
```

**3. Add navigation link in Shell.vue:**
```vue
<nav class="nav" aria-label="Main">
  <RouterLink to="/home" :class="['nav-link', { active: isActive('/home') }]">Home</RouterLink>
  <RouterLink to="/teams" :class="['nav-link', { active: isActive('/teams') }]">Teams</RouterLink>
  <RouterLink to="/settings" :class="['nav-link', { active: isActive('/settings') }]">Settings</RouterLink>
</nav>
```

## Important Considerations

### Route Ordering
- Vue Router matches routes in the order they're defined
- The catch-all route (`/:pathMatch(.*)*`) should always be last
- More specific routes should come before less specific ones

### Lazy Loading
- Always use lazy loading with `() => import(...)` for page components
- This ensures code splitting and better performance
- The router will automatically create separate chunks for each page

### Guard Inheritance
- Children of the Shell route automatically inherit the `auth` guard
- You don't need to specify `meta.guard` for child routes
- For public pages, you must explicitly set `meta: { guard: 'public' }`

### Feature Flags
- Check `src/environments/environment.ts` for available feature flags
- Use conditional spreads to include routes only when features are enabled
- This prevents UI/Server configuration drift (see [Feature Flags](../concepts/feature-flags.md))

### Navigation Link Styling
- Navigation links use the `.nav-link` class
- Active state is handled by the `isActive()` function
- The active class provides visual feedback to users
- Consider adding your link in the marked comment area in Shell.vue

## Testing Your New Page

1. **Development server:** Run `npm run dev` and navigate to your page path
2. **Authentication:** Test that authenticated pages redirect to login when not signed in
3. **Navigation:** Verify the navigation link works and highlights correctly
4. **Feature flags:** If using feature flags, test with both enabled and disabled states
5. **Responsive:** Test on different screen sizes to ensure proper layout

## Troubleshooting

### Page not loading
- Ensure the lazy import path is correct
- Check that the component file exists at the specified path
- Verify the component is properly exported (default export)

### Navigation not working
- Check that the route is properly registered in `routes.ts`
- Ensure the path doesn't conflict with existing routes
- Verify the route is in the correct position (before catch-all)

### Guard issues
- For authenticated pages, ensure they're children of the Shell route
- For public pages, ensure `meta: { guard: 'public' }` is set
- Check that the feature flag (if any) is enabled in `environment.ts`

### Navigation link not highlighting
- Ensure you're using the `isActive()` function correctly
- Check that the path matches exactly (including leading slash)
- Verify the link is inside the `<nav>` element with proper classes
