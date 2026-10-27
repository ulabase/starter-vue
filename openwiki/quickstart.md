---
type: guide
title: Quickstart
description: Entry point for the Ulabase Vue starter wiki, explaining the two-halves model (Vue app plus configured Ulabase service) and routing readers by task to setup, architecture, consents, teams, customization, and operations pages.
tags: [quickstart, guide, entry-point, navigation, onboarding]
sources:
  - id: openwiki-source-4e7cd7f381c92e8c5d89f5c1
    resource: repo://NOTES.md
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
  - id: openwiki-source-eaae96b81373abab97667f4f
    resource: repo://src/environments/environment.ts
  - id: openwiki-source-d4189bbeecb62806cb297b5a
    resource: repo://src/main.ts
  - id: openwiki-source-28ff6ab0b2c280a1e7f9575c
    resource: repo://src/routes.ts
  - id: openwiki-source-c1d5327fe44e08cda82fcf83
    resource: repo://ulabase.setup.consents.ts
  - id: openwiki-source-34f568b222540eb11aa44859
    resource: repo://ulabase.setup.ts
generated: { by: "openwiki/0.7.2", at: "2026-10-19T08:33:44.961Z" }
---

# Quickstart

Welcome to the Ulabase Vue starter documentation. This page explains what the starter is and routes you to the right page for what you are trying to do.

## What is this project?

A Vue app with sign-up, login, Google and GitHub sign-in, email verification, password reset, teams and invitations — working, not sketched. Clone it, point it at a free service, and you have the boring half of an application already done.

It is a Vue app plus a Ulabase service. There is no server of yours to write, deploy or pay for.

## The two halves

Every decision in this repository follows from one fact: **there is no server in this repo**. The application is the Vue app in `src/`; the backend is a Ulabase service that exists outside the repository and is shaped entirely by the two declarative setup files, `ulabase.setup.ts` and `ulabase.setup.consents.ts`.

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart LR
    subgraph Repo["This repository"]
        Env["src/environments/environment.ts<br/>apiUrl + features"]
        App["Vue app<br/>src/main.ts, src/routes.ts"]
        Setup["ulabase.setup.ts<br/>ulabase.setup.consents.ts"]
    end
    subgraph Service["Ulabase service (external)"]
        Accounts["accounts feature<br/>registration, verification, reset, invitations, oauth"]
        Users["users collection + ACL"]
        Guards["Guards rule -> 451"]
    end
    Setup -- "imports environment.features<br/>derives toggles" --> Env
    Setup -- "installs and configures" --> Accounts
    Setup -- "writes apiUrl back" --> Env
    App -- "HTTP via @ulabase/kit-vue" --> Accounts
    App -- "auth.api() with session" --> Users
    Guards -- "blocks requests" --> App
```

Three consequences worth holding onto:

- `src/environments/environment.ts` is the single source of truth for feature flags. The setup file *imports* it, so the app's flags and the service's *Sign-up Mgmt → Features* toggles are derived from one list instead of kept in step by hand.
- The app reacts to status codes; it does not enforce business rules. A `403` from an ACL, a `451` from a Guards rule and a `401` from a missing session are all branch conditions on `ApiError`.
- The last setup step writes the service URL into `apiUrl`. Until it does, the app mounts only the "Connect your service" screen — no router, no auth store, nothing to talk to.

The starter uses [`@ulabase/kit-vue`](integrations/ulabase-kit-vue.md) for authentication, the `useAuth()` composable and router guards, with no custom server code required.

- Email/password sign-up and login
- Google and GitHub sign-in (optional, off by default)
- Email verification and password reset
- Team management and invitations
- Consents gate for terms and privacy policy acceptance (optional, enabled by the second setup file)

## Task routing map

Find your situation in the left column and follow the link.

### Getting started

- **Cloning and running it for the first time** → [First-Run Setup](workflows/first-run-setup.md) — Node 22.18+, `npm install`, creating a free service, choosing between the two setup files, and the ConfigPage screen that appears until `apiUrl` is written.
- **Wondering what the setup scripts actually change on the service** → [Service Configuration](operations/service-configuration.md) — the `defineSetup`/step model, every step in order, and the check/apply idempotency contract.

### Architecture

- **Understanding how the app starts** → [App Bootstrap and Entrypoints](architecture/app-bootstrap.md) — the ConfigPage-vs-app branch in `src/main.ts`, fragment token capture, `createRhAuth`, and the global `beforeEach`.
- **Understanding routes and guards** → [Routing, Guards, and Feature-Gated Routes](architecture/routing-and-guards.md) — the route table, `meta.guard` semantics, flag-conditional route arrays, and the catch-all.
- **Asking "where is the backend?"** → [Service Model: What Lives Outside This Repo](architecture/service-model.md) — the accounts feature, users collection, ACL permissions, JWT claims, and which concerns are enforced server-side.

### Concepts

- **Sign-up, login, verification, reset, session restoration** → [Authentication, Session, and Account Flows](concepts/authentication-flows.md)
- **Requiring Terms and Privacy acceptance** → [Consents Gate](concepts/consents-gate.md) — the four server documents, the client `451` signal, and why the overlay must sit above `authGuard`.
- **Enabling or disabling a feature** → [Feature Flags and Client/Server Consistency](concepts/feature-flags.md) — the flags block as the single source of truth and the failure modes when client and server drift.

### Workflows

- **Changing the look** → [Customizing the Visual Skin](workflows/customizing-the-visual-skin.md) — design tokens, the disposable default skin, the semantic class hooks, and the persisted light/dark toggle.
- **Adding a screen** → [Adding a New Page or Route](workflows/adding-a-new-page.md) — component, lazy route, optional flag gating, `meta.guard`, and navigation.
- **Adding Google sign-in** → [Adding Google OAuth Sign-In](workflows/oauth-setup.md) — the OAuth client, the service callback URL, flipping `oauthLogin`, and re-running setup so credentials land on the service.

### Integrations

- **Working with teams** → [Teams, Members, and Invitations](integrations/teams-and-invitations.md) — team switching, team detail, and the single invitation-acceptance route that serves new users, existing users, and signed-out invitees.
- **Calling your own data endpoints** → [The @ulabase/kit-vue Integration](integrations/ulabase-kit-vue.md) — `useAuth()`, `auth.api()`, `ApiError`, and the `setToken`/`scheduleRefresh` pair.

### Operations

<!-- openwiki: broken internal link [operations/troubleshooting.md] file "operations/troubleshooting.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- **Something is broken right now** → [Troubleshooting and Failure Modes](operations/troubleshooting.md) — origin not allowed, a page missing because of flag drift, `401` on a hand-written `fetch`, the wrong `ulabase` on `PATH`, and the ConfigPage appearing unexpectedly.
- **CI pipelines** → [CI and Repository Workflows](operations/ci-and-workflows.md) — the no-service-URL check on `main` and the scheduled documentation workflow.

### Testing

- **Wondering what verification exists** → [Validation and Testing](testing/validation-and-testing.md) — the `vitest` script with no test files, `vue-tsc` in the build, and the setup scripts' own `check` functions as the de facto harness via `--dry-run`.

## Wiki structure

The wiki is organized into six domains:

| Domain | Purpose | Key pages |
|--------|---------|-----------|
| **Architecture** | Bootstrap, routing, and the service boundary | [App Bootstrap](architecture/app-bootstrap.md), [Routing and Guards](architecture/routing-and-guards.md), [Service Model](architecture/service-model.md) |
| **Concepts** | Cross-cutting mechanisms | [Authentication Flows](concepts/authentication-flows.md), [Consents Gate](concepts/consents-gate.md), [Feature Flags](concepts/feature-flags.md) |
| **Workflows** | Step-by-step guides | [First-Run Setup](workflows/first-run-setup.md), [Customizing the Visual Skin](workflows/customizing-the-visual-skin.md), [Adding a New Page](workflows/adding-a-new-page.md), [OAuth Setup](workflows/oauth-setup.md) |
| **Integrations** | The kit and the multi-tenant feature | [Ulabase Kit Vue](integrations/ulabase-kit-vue.md), [Teams and Invitations](integrations/teams-and-invitations.md) |
<!-- openwiki: broken internal link [operations/troubleshooting.md] file "operations/troubleshooting.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Operations** | Service configuration, CI, and failure modes | [Service Configuration](operations/service-configuration.md), [CI and Workflows](operations/ci-and-workflows.md), [Troubleshooting](operations/troubleshooting.md) |
| **Testing** | Validation and testing | [Validation and Testing](testing/validation-and-testing.md) |

## Key files

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | `apiUrl` plus the feature flags; empty `apiUrl` in the starter's own repository |
| `src/main.ts` | Entry point: ConfigPage branch, fragment token capture, `createRhAuth({ apiBaseUrl, onError: consentsOnError })`, router and the single `beforeEach` |
| `src/routes.ts` | Route map: lazy page chunks, flag-conditional entries, `meta.guard` |
| `src/consents-signal.ts` / `src/ConsentsGate.vue` | The `451` flag raised by `onError` and the blocking overlay wrapped around the router view |
| `src/styles.css` | Design tokens and the disposable default skin |
| `ulabase.setup.ts` | Declarative service configuration: accounts feature, feature toggles, optional Google credentials, origin allowlist, `apiUrl` write-back |
| `ulabase.setup.consents.ts` | Imports the file above and appends the gate's four documents |

## Next steps

1. **New to the project?** Start with [First-Run Setup](workflows/first-run-setup.md).
2. **Want to understand the code?** Read [App Bootstrap](architecture/app-bootstrap.md), then [Routing and Guards](architecture/routing-and-guards.md).
3. **Want to make it yours?** [Customizing the Visual Skin](workflows/customizing-the-visual-skin.md), then [Adding a New Page](workflows/adding-a-new-page.md).
4. **Extending the backend behaviour?** Read [Service Model](architecture/service-model.md) before [Service Configuration](operations/service-configuration.md).

## Common issues

- **"Origin not allowed" error** → Re-run `ulabase setup`, or add the origin under *Service → Origin Allowlist*.
- **A page is missing and its link is gone** → The flags in `environment.ts` no longer match the service toggles; re-run `ulabase setup`.
- **`401` on a request you wrote yourself** → Use `auth.api()` instead of a plain `fetch`.
- **`ulabase` runs something unexpected** → A retired tool of the same name is earlier in `PATH`; `type -a ulabase` shows both.
- **Consents accepted but still blocked** → The gate needs a fresh token; see the renewal path in [Consents Gate](concepts/consents-gate.md).

<!-- openwiki: broken internal link [operations/troubleshooting.md] file "operations/troubleshooting.md" does not exist. Fix the href or restore the target, then delete this comment. -->
For a symptom-oriented reference, see [Troubleshooting and Failure Modes](operations/troubleshooting.md).
