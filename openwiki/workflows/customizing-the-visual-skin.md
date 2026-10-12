---
type: workflow
title: Customizing the Visual Skin
description: Explains the theming system with design tokens in styles.css, the disposable default skin, and the swap map for adopting UI frameworks.
tags: [theming, css, design-tokens, dark-mode, swap-map, visual-skin]
verified:
  - by: openwiki/0.7.2
    at: 2026-10-12T10:21:41.724Z
sources:
  - id: openwiki-source-4e7cd7f381c92e8c5d89f5c1
    resource: repo://NOTES.md
  - id: openwiki-source-ee9a644578aeccba70142314
    resource: repo://src/pages/shell/Shell.vue
  - id: openwiki-source-146419bb9b2415894a6bd677
    resource: repo://src/styles.css
  - id: openwiki-source-b8c028d1d8f7920e8191bbe2
    resource: repo://src/ui/alert/Alert.vue
generated: { by: "openwiki/0.7.2", at: "2026-10-12T10:21:41.724Z" }
---

# Customizing the Visual Skin

The Ulabase Vue starter uses a two-layer CSS architecture that separates design tokens from the disposable default skin. This design enables easy theming: change tokens to re-theme the entire app, or delete the skin and adopt a UI framework using the swap map.

## Two-Layer CSS Architecture

### Layer 1: Design Tokens (Section 1)

The `src/styles.css` file contains design tokens in the `:root` selector that define the app's visual language:

- **Colour**: Background, surface, border, text, accent, link, success, error, and grid colours
- **Typography**: Font families, size scale, line heights, and tracking
- **Space**: Consistent spacing scale (space-1 through space-8)
- **Shape**: Border radii and widths
- **Motion**: Transitions and shadow definitions
- **Focus**: Focus ring width and offset

```css
:root {
  /* ── Colour ─────────────────────────────────────────────────────────── */
  --color-bg: #f4f6f8;
  --color-surface: #ffffff;
  --color-surface-sunken: #eef1f4;
  --color-border: #d8dde4;
  --color-border-strong: #b6bfcb;
  --color-text: #14171c;
  --color-text-muted: #656d7a;

  /* Ulabase amber — the one accent. Paired with dark text. */
  --color-primary: #f8a839;
  --color-primary-hover: #e0942b;
  --color-on-primary: #14171c;

  /* Ulabase's teal-green, darkened for readable text-link contrast
     on white (also part of the same brand palette). Doubles as "success". */
  --color-link: #1f6f54;
  --color-success: #1f6f54;

  --color-error: #b91c1c;
  --color-error-bg: #fef2f2;
  --color-on-error: #ffffff;

  /* Faint drafting-paper grid painted on the page background. */
  --color-grid: rgba(20, 23, 28, 0.045);
  
  /* ... additional tokens ... */
}
```

### Layer 2: Disposable Default Skin (Sections 3-5)

Sections 3-5 contain the default skin classes that implement the visual design:

- **Section 3**: Core UI components (cards, buttons, forms, feedback)
- **Section 4**: Auth page layouts (login, signup, password reset)
- **Section 5**: Config page layout

This layer is explicitly marked as disposable and meant to be thrown away when adopting a UI framework.

## Dark Mode Implementation

Dark mode is implemented through class-based token overrides. Adding the `dark` class to the root element overrides all design tokens:

```css
:root.dark {
  /* ── Colour ─────────────────────────────────────────────────────────── */
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-surface-sunken: #0d1117;
  --color-border: #30363d;
  --color-border-strong: #484f58;
  --color-text: #e6edf3;
  --color-text-muted: #8b949e;
  
  /* ... additional dark overrides ... */
}
```

### Theme Toggle Mechanism

The dark mode toggle is implemented in `src/pages/shell/Shell.vue` using the `useTheme` composable:

```typescript
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
```

**Key behaviors:**
- Reads initial state from `localStorage` key `rh-theme`
- Toggles the `dark` class on `document.documentElement`
- Persists user preference to `localStorage`
- Default is light mode

## Swap Map for UI Framework Adoption

Components reference a stable vocabulary of semantic class hooks. When adopting a UI framework, replace these hooks with framework-specific components:

| Class Hook | Used For | Tailwind Example | Vuetify Example |
|------------|----------|------------------|-----------------|
| `.card` / `.card-header` | Section container + title row | `rounded border p-6 mb-6` | `<v-card>` |
| `.btn-primary` | The one accented action per form | `px-6 py-2 rounded bg-amber-400 font-semibold` | `<v-btn variant="flat">` |
| `.btn-secondary` | Quiet bordered action | `px-3 py-2 rounded border text-xs uppercase` | `<v-btn variant="outlined">` |
| `.btn-danger` / `.btn-danger-text` | Destructive action / inline variant | `... text-red-700 border-red-700` | `<v-btn variant="outlined" color="error">` |
| `.form-field` / `.form-field-sm` / `.form-row` | Label+control stack; `-sm` is narrow; `-row` lays fields side by side | `flex flex-col gap-1` / `flex gap-3` | `<v-text-field>` |
| `.password-field` / `.btn-toggle-password` | Password input with Show/Hide toggle | `relative` / `absolute right-2` | `<v-text-field>` + `append-inner` slot |
| `.form-error` / `.field-error` | Form-level / per-field error | `rounded border border-red-300 bg-red-50 p-3` | `<v-alert type="error">` |
| `.success-msg` | Success feedback | `rounded border border-emerald-300 bg-emerald-50 p-3` | — (usually a snackbar) |
| `.muted` | Secondary/caption text | `text-sm text-gray-500` | `class="text-body-2"` |
| `.badge` | Small status pill | `rounded-full px-2 text-xs uppercase` | `<v-chip size="small">` |
| `.back-link` / `.eyebrow` | Back navigation / label above a title | `text-xs uppercase tracking-wide` | — |
| `.placeholder` / `.skeleton` | Empty-slot outline / loading block | `border border-dashed p-6` / `animate-pulse bg-gray-200` | `<v-progress-linear>` |
| `.auth-page` / `.auth-card` / `.auth-links` / `.divider` | Centred auth layout | `min-h-screen grid place-items-center` / `w-90 rounded border p-8` | `<v-card>` |
| `.config-page` / `.config-card` / `.config-status` / `.config-steps` | "Connect your service" screen | — | — |

## Alert Component Design

The Alert component (`src/ui/alert/Alert.vue`) carries no styles of its own — only the `.success-msg` and `.form-error` hooks plus ARIA roles:

```vue
<template>
  <div
    :class="type === 'success' ? 'success-msg' : 'form-error'"
    :role="type === 'success' ? 'status' : 'alert'"
  >
    <span style="flex: 1"><slot /></span>
    <button
      v-if="dismissible"
      type="button"
      aria-label="Dismiss"
      @click="emit('close')"
    >
      &times;
    </button>
  </div>
</template>
```

**Key properties:**
- `type`: Either `'success'` or `'error'`
- `dismissible`: Shows close button (default: `true`)
- `autoDismiss`: Auto-close after milliseconds (default: `4000`)

**Design implications:**
- Swap the Alert component and every success/error message in the app follows
- Styling is controlled entirely by the semantic class hooks in styles.css
- ARIA roles are automatically applied based on message type

## Customization Paths

### Option A: Tweak the Skin (Fastest - ~1 hour)

1. **Change tokens** in `styles.css` section 1 — colours, type scale, spacing, radii
2. **Adjust skin classes** in section 3 for different shapes
3. **Replace shell layout** in `pages/shell/`
4. **Replace placeholder content** in `pages/home/`

### Option B: Adopt a UI Framework (More Flexible)

1. **Delete sections 3-5** of `styles.css` (keep section 1 if needed)
2. **Reskin components** using the swap map above
3. **Replace Alert component** with framework-specific feedback component
4. **Update page-specific layouts** in component CSS files

## Page-Specific Layout Classes

Layout classes specific to individual pages stay in component CSS files and are **not** part of the semantic contract:

- `.team-row`, `.member-row` in teams pages
- `.feature-grid` in home page
- Other page-specific layouts

These can be replaced independently when adopting a new design system.

## Implementation Example

Here's how the login page uses the semantic class hooks:

```vue
<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1>Log in</h1>

      <Alert v-if="error" type="error" @close="error = null">{{ error }}</Alert>

      <form novalidate @submit.prevent="submit">
        <label for="login-email">Email</label>
        <input id="login-email" v-model="email" type="email" />
        
        <label for="login-password">Password</label>
        <div class="password-field">
          <input id="login-password" v-model="password" type="password" />
          <button type="button" class="btn-toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <button type="submit">Log in</button>
      </form>

      <p class="auth-links">
        <RouterLink to="/auth/forgot-password">Forgot password?</RouterLink>
        · <RouterLink to="/auth/signup">Create an account</RouterLink>
      </p>
    </div>
  </main>
</template>
```

## Best Practices

1. **Always use semantic class hooks** — never hardcode styles in templates
2. **Keep page-specific layouts separate** — use component CSS files for unique layouts
3. **Test dark mode** — ensure all token-dependent styles work in both modes
4. **Maintain ARIA roles** — preserve accessibility when swapping components
5. **Update swap map** — document new hooks when extending the vocabulary

## Related Documentation

- [Routing and Navigation Guards](../architecture/routing-and-guards.md) - Route structure and shell layout
- [Adding a New Page](./adding-a-new-page.md) - How to add pages with proper styling
- [NOTES.md](../../NOTES.md) - Complete swap map and customization details
