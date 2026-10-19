---
type: workflow
title: First-Run Setup
description: Walkthrough of cloning, installing, creating a Ulabase service, running ulabase setup, and starting the development server.
tags: [setup, onboarding, ulabase, cli, environment, service-configuration]
sources:
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
  - id: openwiki-source-eaae96b81373abab97667f4f
    resource: repo://src/environments/environment.ts
  - id: openwiki-source-c1d5327fe44e08cda82fcf83
    resource: repo://ulabase.setup.consents.ts
  - id: openwiki-source-34f568b222540eb11aa44859
    resource: repo://ulabase.setup.ts
generated: { by: "openwiki/0.7.2", at: "2026-10-13T10:12:04.743Z" }
---

# First-Run Setup

This page walks through the complete first-run setup process for the Ulabase Vue starter application, from cloning the repository to running the development server. The process involves four main steps: cloning the repository, creating a Ulabase service, configuring the service with `ulabase setup`, and starting the development server.

## Prerequisites

Before beginning, ensure you have:

- **Node.js 22.18 or later** — required to run the TypeScript setup file
- **A free Ulabase account** — sign up at [ulabase.com](https://ulabase.com) (free tier available)
- **Git** — for cloning the repository

## Step 1: Clone and Install

```bash
git clone https://github.com/ulabase/starter-vue.git
cd starter-vue
npm install
```

This installs the Vue application dependencies and the `@ulabase/cli` development dependency (listed in `devDependencies` in `package.json`).

## Step 2: Create a Ulabase Service

Create a **free service** at [ulabase.com](https://ulabase.com). The service ID is the first six characters of its URL (e.g., `abc123` from `https://abc123.ulabase.app`). You'll need this ID for the setup step.

## Step 3: Configure the Service

The Ulabase service needs specific configuration to work with the Vue starter application. Instead of manually configuring each setting through the console, the starter uses a declarative setup file (`ulabase.setup.ts`) that configures the service automatically.

### Install the CLI and Authenticate

```bash
npm install -g ulabase
ulabase login                              # paste a token from ulabase.com
```

### Run the Setup

```bash
ulabase setup --srv <srvId>
```

Replace `<srvId>` with your six-character service ID.

### What the Setup Does

The `ulabase.setup.ts` file defines an ordered list of **steps**, where each step has a `check` (is the desired state already present?) and an `apply` (make it so). This creates an idempotent configuration pattern:

- **`check`** returns `true` when the service already matches the desired state
- **`apply`** makes the change only when `check` returned `false`
- Running `ulabase setup` against an already-configured service writes nothing and reports every step as satisfied

The setup performs these steps in order:

1. **Accounts feature installed** — Installs the `accounts` plugin if not present. Treats HTTP 409 ("already installed") as success.

2. **Accounts configured to match the app** — Sets `app-name`, `frontend-url`, `frontend-app-url`, and the derived `features` block. Uses a read-modify-write pattern that preserves redacted secrets.

3. **Google OAuth credentials** *(conditional)* — Only included when `oauthLogin` is `true` and `'google'` is in `oauthProviders`. Ensures `enabled: true` and that `client-id` and `client-secret` are configured.

4. **The app origin may call the service** — Installs `origin-allowlist` if needed, then adds `APP_URL` to the allowed origins. Origins are added, never replaced, so a service reached from multiple origins (localhost and deployed app) keeps both.

5. **The app points at this service** — The `appPointsAtService` step, exported separately and always placed **last**. Writes the service's URL into `environment.ts`'s `apiUrl` field using regex replacement that preserves comments and other lines. Placed last so that a partial setup leaves the "configure your service" screen visible rather than a sign-up page that fails.

### Feature Flag Derivation

The setup file imports the **same** `environment.ts` file that the client uses and derives the server's feature toggles from it. This eliminates the drift problem where client and server configurations diverge silently.

```typescript
// ulabase.setup.ts (excerpt)
import { environment } from './src/environments/environment.ts';

const f = environment.features;

const features = {
  registration: f.emailRegistration,
  verification: f.emailRegistration,   // registration and verification are one flow
  'password-reset': f.passwordReset,
  invitations: f.teamInvitations,
  oauth: f.oauthLogin,
};
```

The flags are declared once, in one place, and both client and server consume that single source of truth. When `ulabase setup` runs, it compares the derived `features` object with the service's current configuration and applies any missing changes.

### The --dry-run Flag

To see what a service is missing without making any changes:

```bash
ulabase setup --srv <srvId> --dry-run
```

This runs only the checks, giving you an honest answer to "what is this service missing?" without touching the service configuration.

### The --file Flag for Consents

To set up the service with the **consents gate** (requiring users to accept Terms of Service and Privacy Policy):

```bash
ulabase setup --srv <srvId> --file ulabase.setup.consents.ts
```

This uses `ulabase.setup.consents.ts` instead of the default `ulabase.setup.ts`. The consents setup extends the base accounts setup by importing its steps and appending additional steps for the consents gate. The gate blocks users who haven't accepted the current versions of your legal documents.

**Important:** Replace the placeholder `public/terms.html` and `public/privacy.html` files with your actual legal documents.

### Environment Variables

The setup uses these environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_URL` | `http://localhost:5173` | Where the app is served from. Used for email links, OAuth redirects, and the origin allowlist. Trailing slash is stripped. |
| `APP_NAME` | `Ulabase Starter` | Shown in verification, reset, and invitation emails. |

Both can be overridden via environment variables before running setup.

## Step 4: Start the Development Server

```bash
npm run dev
```

The Vite development server starts, and you can access the application at `http://localhost:5173`. The app will show the "Connect your service" screen if `apiUrl` is empty, or the full application if setup completed successfully.

## Google Sign-in (Optional)

The app starts with email and password authentication by default. To add Google OAuth sign-in:

1. **Create OAuth client** — In the Google Cloud console, create an OAuth client of type *Web application* with this redirect URI: `https://<srvId>.ulabase.app/auth/oauth/callback/google`

2. **Enable the feature** — In `src/environments/environment.ts`, set `oauthLogin: true` (the `oauthProviders` array already lists `google`)

3. **Re-run setup with credentials** — The credentials go to the service, never into the app:

```bash
GOOGLE_CLIENT_ID=… GOOGLE_CLIENT_SECRET=… ulabase setup --srv <srvId>
```

The setup step for Google OAuth credentials only runs when `oauthLogin` is `true` and `'google'` is in `oauthProviders`. This ensures a server with the feature on but no credentials doesn't answer OAuth redirects with errors.

## The apiUrl Configuration

The `apiUrl` field in `src/environments/environment.ts` must be empty on the main branch. The CI pipeline enforces this in the no-service-url workflow. When you run `ulabase setup`, the `appPointsAtService` step writes the service URL into this field, but you should:

- **For local development:** Keep the URL after setup
- **For commits to main:** Leave `apiUrl` empty (the CI will fail if it's not)
- **For your own deployment:** Commit the file with your service URL

To keep your local `apiUrl` edit out of `git status`:
```bash
git update-index --assume-unchanged src/environments/environment.ts
```

## Troubleshooting

### Everything fails, and the console says the origin is not allowed
The service only answers pages it has been told about. Re-run `ulabase setup` after changing where the app is served from, or add the origin under *Service → Origin Allowlist*.

### A page is missing and its link is gone
The feature flags in `environment.ts` must match the service's *Sign-up Mgmt → Features* toggles. `ulabase setup` reads the flags from that same file and sets the service to match, so re-running it is usually the fix.

### `401` on a request you wrote yourself
A plain `fetch` carries no session. Use `auth.api()`, which attaches it — see [auth.api() - Authenticated Fetch Wrapper](../integrations/ulabase-kit-vue.md#authapi---authenticated-fetch-wrapper).

### `ulabase` runs something about OpenShift
A different, retired tool of the same name is first in your `PATH`. `type -a ulabase` shows both.

## Next Steps

After completing the first-run setup:

1. **Customize the look** — See [Customizing the Visual Skin](customizing-the-visual-skin.md) for instructions on restyling the starter
2. **Add OAuth** — See [OAuth Setup](oauth-setup.md) for detailed Google OAuth configuration
3. **Understand the architecture** — See [App Bootstrap and Entry Point](../architecture/app-bootstrap.md) for how the application initializes
4. **Learn about feature flags** — See [Feature Flags](../concepts/feature-flags.md) for how flags control both client and server behavior
5. **Deep dive into service configuration** — See [Service Configuration](../operations/service-configuration.md) for complete details on the setup process
