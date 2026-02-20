---
name: payment-centralization
description: >
  Use when exploring, planning, or implementing a centralized payment architecture
  across multiple payment types (consultation, services, subscriptions) in a
  NestJS/monorepo codebase. Guides Claude to deeply explore existing implementations
  before writing a single line of code, then produce a unified, reusable design.
---

# Payment Centralization Skill

## Purpose

This skill guides Claude through the process of centralizing multiple payment gateway
integrations into a single, reusable architecture. It is designed for tasks where:

- Multiple payment flows exist (e.g. consultation, services, subscriptions)
- An existing correct implementation should serve as the reference blueprint
- A new module (e.g. subscriptions) needs to follow the same patterns
- The goal is maximum code reuse and a shared payments foundation

---

## Phase 1 — Deep Exploration (DO THIS FIRST, always)

Before writing any code, planning any files, or forming any opinions:

### 1a. Read all provided documentation

- Open every Notion page and markdown file the user has referenced
- Read them completely — do not skim
- Note: payment flow diagrams, API contracts, webhook handling, error states, env vars

### 1b. Explore the reference implementation

The user will point you to an existing correct module (e.g. `@apps/web/app/consultation/`).
For that module, explore and document:

**File structure** — list every file and its responsibility
**Payment initiation** — how is a payment session started? What service/controller handles it?
**Gateway interaction** — which gateway SDK/API is called? What params are passed?
**Webhook handling** — how are payment events received processed?
**State management** — how is payment status persisted (DB schema, repository pattern)?
**Error handling** — what happens on failure, timeout, or cancellation?
**DTOs and interfaces** — what types/contracts are defined?
**Shared utilities** — is anything already abstracted into a shared module?

### 1c. Evaluate the existing subscription plan (if provided)

- Read the current subscription implementation plan critically
- Compare it line-by-line against the reference implementation patterns
- Flag every deviation: missing webhook handling, different DTO shapes, skipped error states
- Mark each item as: ✅ Correct | ⚠️ Needs Adjustment | ❌ Wrong / Missing

Do NOT proceed until Phase 1 is complete.

---

## Phase 2 — Gap Analysis & Centralization Mapping

After exploration, produce a structured analysis:

### Commonalities across payment types

List every pattern that is identical or near-identical across consultation, services,
and subscriptions. These are candidates for the shared/central module.

Examples to look for:

- Payment session creation
- Webhook signature verification
- Payment status enum and transitions
- Error response formatting
- Idempotency key generation
- Logging and audit trail

### Differences that must remain per-module

List things that genuinely differ and cannot be centralized:

- Business logic tied to a specific domain (e.g. booking a consultation slot on payment success)
- Domain-specific webhook events
- Module-specific DTOs

### Proposed shared module structure

Sketch the folder/file layout of a `payments/` shared module before writing any code.
Get user confirmation before proceeding.

---

## Phase 3 — Implementation Plan

Only after the user confirms the proposed structure:

1. Define the shared `PaymentService` interface / abstract class
2. Define shared DTOs, enums, and error types
3. Refactor the reference module to use the shared layer (non-breaking)
4. Implement the subscription module using shared components
5. Update any DI / module registration in NestJS

For each step, reference the equivalent pattern from the consultation module explicitly.
Example: _"The `SubscriptionWebhookHandler` follows the same pattern as `ConsultationWebhookHandler` at `consultation/webhooks/consultation-webhook.handler.ts`"_

---

## Output Format

After Phase 1, produce a report with these sections:

```
## Reference Module Analysis
[findings from 1b]

## Documentation Summary
[key facts from Notion/markdown docs]

## Subscription Plan Audit
[line-by-line evaluation from 1c]

## Centralization Opportunities
[from Phase 2]

## Proposed Shared Module Layout
[file tree with one-line descriptions]

## Implementation Roadmap
[numbered steps with file paths]
```

---

## Rules

- **Never write implementation code before completing Phase 1**
- **Always cite the exact file path** when referencing an existing pattern
- **If a Notion page or doc is ambiguous**, ask a targeted clarifying question — do not assume
- **If the subscription plan contradicts the reference implementation**, flag it explicitly before accepting it
- **Prefer extending existing abstractions** over creating new ones
