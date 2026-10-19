# Files

- [Authentication, Session, and Account Flows](authentication-flows.md) - End-to-end client flows for register, login, email verification, password reset, OAuth redirect, session restoration/renewal, and profile/password changes, including the token-in-fragment landing and how failures surface as Alert messages.
- [Consents Gate (Terms and Privacy Acceptance)](consents-gate.md) - How the consents gate blocks authenticated requests with 451 until the user accepts the current ToS and Privacy Policy: the four server documents, the client signal, and the root-mounted overlay.
- [Feature Flags](feature-flags.md) - Explains the feature-flag system in environment.ts and how flags control both client routing/UI and server-side service configuration.
