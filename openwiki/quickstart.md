---
type: guide
title: Quickstart
description: Entry point for the Ulabase Vue starter wiki, routing readers to the right pages by role and task.
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
generated: { by: "openwiki/0.7.2", at: "2026-10-17T07:34:48.741Z" }
verified:
  - by: openwiki/0.7.2
    at: 2026-10-17T07:34:48.741Z
---

# Quickstart

Welcome to the Ulabase Vue starter documentation. This page is your entry point to the wiki—it routes you to the right pages based on what you need to do.

## What is this project?

A Vue app with sign-up, login, Google and GitHub sign-in, email verification, password reset, teams and invitations — working, not sketched. Clone it, point it at a free service, and you have the boring half of an application already done.

It is a Vue app plus a Ulabase service. There is no server of yours to write, deploy or pay for.

The starter uses [`@ulabase/kit-vue`](integrations/ulabase-kit-vue.md) for authentication and routing, with no custom server code required.

- Email/password sign-up and login
- Google and GitHub sign-in (optional)
- Email verification and password reset
- Team management and invitations
- Consents gate for terms and privacy policy acceptance

## Task routing map

Find your task below and follow the link.

### Getting started

- **First time here?** → [First-Run Setup](workflows/first-run-setup.md)  
  Clone, install, create a service, run setup, and start the dev server.

- **Understand the architecture** → [App Bootstrap](architecture/app-bootstrap.md) and [Routing and Guards](architecture/routing-and-guards.md)  
  How the app initializes, routes, and guards pages.

- **Configure features** → [Feature Flags](concepts/feature-flags.md)  
  Enable/disable email registration, OAuth, password reset, and team invitations.

### Customization

- **Change the look** → [Customizing the Visual Skin](workflows/customizing-the-visual-skin.md)  
  Theming via design tokens, swapping UI frameworks, and restyling components.

- **Add new pages** → [Adding a New Page](workflows/adding-a-new-page.md)  
  Create components, register routes, and add navigation.

### Authentication and users

- **Set up OAuth** → [OAuth Provider Setup](workflows/oauth-setup.md)  
  Configure Google (or other) OAuth sign-in.

- **Understand auth flows** → [Authentication Flows](concepts/authentication-flows.md)  
  Sign-up, login, verification, password reset, and session management.

- **Consents gate** → [Consents Gate Pattern](concepts/consents-gate.md)  
  Require terms and privacy policy acceptance.

### Teams and invitations

- **Team management** → [Teams and Invitations](integrations/teams-and-invitations.md)  
  Create teams, invite members, and manage invitations.

### Service configuration

- **Service setup** → [Service Configuration](operations/service-configuration.md)  
  Declarative setup files and the idempotent check/apply pattern.

- **CI/CD** → [CI and Workflows](operations/ci-and-workflows.md)  
  GitHub Actions for URL validation and wiki updates.

### Testing and validation

- **Testing** → [Validation and Testing](testing/validation-and-testing.md)  
  Test setup, validation strategies, and CI guards.

## Wiki structure

The wiki is organized into six domains:

| Domain | Purpose | Key pages |
|--------|---------|-----------|
| **Architecture** | System design and bootstrap | [App Bootstrap](architecture/app-bootstrap.md), [Routing and Guards](architecture/routing-and-guards.md) |
| **Concepts** | Core patterns and mechanisms | [Feature Flags](concepts/feature-flags.md), [Authentication Flows](concepts/authentication-flows.md), [Consents Gate](concepts/consents-gate.md) |
| **Workflows** | Step-by-step guides | [First-Run Setup](workflows/first-run-setup.md), [Customizing the Visual Skin](workflows/customizing-the-visual-skin.md), [Adding a New Page](workflows/adding-a-new-page.md), [OAuth Setup](workflows/oauth-setup.md) |
| **Operations** | Deployment and CI | [Service Configuration](operations/service-configuration.md), [CI and Workflows](operations/ci-and-workflows.md) |
| **Integrations** | External service connections | [Teams and Invitations](integrations/teams-and-invitations.md), [Ulabase Kit Vue](integrations/ulabase-kit-vue.md) |
| **Testing** | Validation and testing | [Validation and Testing](testing/validation-and-testing.md) |

## Key files

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | API URL and feature flags |
| `src/main.ts` | App entry point, auth setup with consents error handler, router creation |
| `src/routes.ts` | Route map with feature-flag gating |
| `src/styles.css` | Design tokens and disposable skin |
| `ulabase.setup.ts` | Declarative service configuration |
| `ulabase.setup.consents.ts` | Consents gate setup |

## Next steps

1. **New to the project?** Start with [First-Run Setup](workflows/first-run-setup.md)
2. **Want to customize?** Check [Customizing the Visual Skin](workflows/customizing-the-visual-skin.md)
3. **Need to understand the code?** Read [App Bootstrap](architecture/app-bootstrap.md) and [Routing and Guards](architecture/routing-and-guards.md)
4. **Ready to extend?** Follow [Adding a New Page](workflows/adding-a-new-page.md)

## Common issues

- **"Origin not allowed" error** → Re-run `ulabase setup` or add your origin in the service console
- **Missing page/route** → Check feature flags in `environment.ts` match service toggles
- **401 on custom requests** → Use `auth.api()` instead of plain `fetch`
- **`ulabase` command not found** → Check for conflicting installations with `type -a ulabase`

For more detailed troubleshooting, see the individual workflow and concept pages linked above.
