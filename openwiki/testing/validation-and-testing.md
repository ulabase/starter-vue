---
type: "Guide"
title: "Validation and Testing"
description: "Describes the testing setup, TypeScript strict mode, vue-tsc build step, CI guard against committing real service URLs, and recommended validation strategies for the starter."
tags: ["testing", "validation", "typescript", "ci", "vitest", "vue-tsc"]
sources:
  - id: openwiki-source-47f38fcb8c1752310057a5c1
    resource: repo://.github/workflows/no-service-url.yml
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-eaae96b81373abab97667f4f
    resource: repo://src/environments/environment.ts
  - id: openwiki-source-d4189bbeecb62806cb297b5a
    resource: repo://src/main.ts
  - id: openwiki-source-98d5ddb014a0fd4d678f6f2a
    resource: repo://tsconfig.json
generated: { by: "openwiki/0.7.2", at: "2026-10-12T10:21:41.724Z" }
---

# Validation and Testing

The ulabase Vue starter ships with a **TypeScript-first, no-test-files-yet** validation story.  The repository provides strong static guarantees via strict-mode TypeScript and a CI safety net that prevents real service URLs from landing on `main`, but it does not yet contain any automated unit or integration tests.  This page documents the tooling that is in place and recommends practical validation strategies for developers building on the starter.

## TypeScript Strict Mode

The project enables TypeScript's full strict mode plus additional checks in `tsconfig.json` (`repo://tsconfig.json#L14-L17`):

| Flag | What it catches |
|------|----------------|
| `strict: true` | Turns on the full strict family: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, etc. |
| `noUnusedLocals: true` | Errors when a local variable is declared but never read. |
| `noUnusedParameters: true` | Errors when a function parameter is declared but never used. |
| `noFallthroughCasesInSwitch: true` | Errors when a `switch` case falls through to the next case without a `break` or explicit comment. |

These flags run during both the `vue-tsc` build step and editor feedback, so many categories of bugs are caught before any runtime testing.

## The `vue-tsc -b` Build Step

The `build` script in `package.json` (`repo://package.json#L7`) is:

```bash
vue-tsc -b && vite build
```

`vue-tsc` is a Vue-aware wrapper around the TypeScript compiler (`tsc`) that type-checks both `.ts` and `.vue` single-file components.  The `-b` (build mode) flag reads the project's `tsconfig.json` and performs a full program check, emitting no output files (`noEmit: true` is set).  Because it runs **before** `vite build`, any type error breaks the production build early, before Vite bundles anything.

This means the project relies on `vue-tsc` as its primary "test gate" for correctness: if the types align, the build succeeds; if they don't, CI fails.

## Vitest: Configured but Empty

Vitest is listed as a devDependency (`repo://package.json#L22`) and the `test` script exists (`repo://package.json#L9`):

```bash
"test": "vitest"
```

However, the repository currently contains **no test files**.  Running `npm test` starts Vitest in watch mode but finds nothing to execute.  This is intentional for a starter: teams are expected to add their own test files alongside the components and services they create.  Vitest's Vite-native architecture means it shares the project's Vite config, aliases, and plugins with zero extra setup.

## CI: The No-Service-URL Guard

The `.github/workflows/no-service-url.yml` workflow (`repo://.github/workflows/no-service-url.yml`) is a dedicated safety net that runs on every push and pull request to `main` **only in the `ulabase/starter-vue` repository** (`github.repository == 'ulabase/starter-vue'`; forks are skipped).

**What it checks:** It greps all `src/environments/*.ts` files for a non-empty `apiUrl` value.  If any environment file contains a real URL (e.g., `apiUrl: 'https://xyz.ulabase.app'`), the job fails with an explicit error message.

**Why it exists:** The starter's environment file (`repo://src/environments/environment.ts#L9`) ships with `apiUrl: ''` on purpose.  When a developer runs `ulabase setup`, the CLI writes their real service URL into that file.  If that edit were committed back to the upstream starter's `main` branch, every subsequent clone would silently point at that one developer's service.  The CI check prevents this.

**How it works:** The grep pattern `^\s*apiUrl:\s*'[^']+'` matches any line where `apiUrl` is set to a non-empty single-quoted string.  An empty `apiUrl: ''` does not match, so the starter's default passes.

## Recommended Validation Strategies

Given the current state of the starter (strong static checking, no automated tests), the following validation approaches are recommended:

### 1. Type-Checking with `vue-tsc`

Run the full build to catch type errors across `.ts` and `.vue` files:

```bash
npm run build
```

This is the single most valuable automated check in the repository.  It enforces strict null checks, catches unused variables and parameters, and validates template bindings in Vue SFCs.

### 2. Feature-Flag Consistency Checks

The environment file (`repo://src/environments/environment.ts#L11-L15`) declares feature flags such as `emailRegistration`, `passwordReset`, and `oauthLogin`.  After changing these flags, re-run the Ulabase setup wizard in dry-run mode to verify the flags are consistent with the service configuration:

```bash
npx ulabase setup --dry-run
```

This validates that enabled features have the corresponding service-side configuration without making live changes.

### 3. Manual Browser Testing for Auth Flows

The app's authentication flows (sign-up, sign-in, OAuth, password reset) involve redirects, URL fragment tokens, and guard logic (`repo://src/main.ts#L12-L34`, `repo://src/main.ts#L59-L63`).  These are difficult to unit-test without significant mocking infrastructure.  Manual testing with a real or staging Ulabase service is the practical approach:

- **Unconfigured service:** Leave `apiUrl` empty and confirm the `ConfigPage` (`repo://src/main.ts#L45`) renders with instructions.
- **Email sign-up:** Set a real `apiUrl`, register a new account, and verify the verification redirect and `consumeFragmentToken` logic.
- **Auth guard:** Navigate to a guarded route while logged out and confirm redirect to sign-in.
- **Public guard:** Navigate to a public-only route (e.g., sign-in page) while logged in and confirm redirect to the dashboard.

### 4. Adding Automated Tests

When you're ready to add tests, create files matching `*.test.ts` or `*.spec.ts` in the `src/` directory.  Vitest will discover them automatically.  Recommended starting points:

- **Unit tests** for pure utility functions (e.g., `consumeFragmentToken` extraction logic).
- **Component tests** using `@vue/test-utils` for pages like `ConfigPage`.
- **Integration tests** for router guard behavior with mocked auth stores.

## Relationship to CI Workflows

The CI pipeline (documented in [CI and Workflows](../operations/ci-and-workflows.md)) currently runs only the no-service-url check on the upstream starter.  Teams forking the repo are encouraged to extend CI with:

```yaml
- run: npm run build   # vue-tsc + vite build
- run: npm test        # vitest (once tests exist)
```

This ensures both static type safety and test correctness on every pull request.
