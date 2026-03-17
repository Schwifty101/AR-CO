# Lemon Squeezy Integration Reference for AR-CO

## Overview

Lemon Squeezy is AR-CO's payment provider, handling all monetary transactions as a Merchant of Record (MoR). This means Lemon Squeezy handles tax collection, compliance, and payment processing — AR-CO does not need to deal with tax calculations or payment PCI compliance directly.

**Official Resources:**
- API Docs: https://docs.lemonsqueezy.com/api
- JS SDK: https://github.com/lmsqueezy/lemonsqueezy.js
- Developer Guide: https://docs.lemonsqueezy.com/guides/developer-guide

## AR-CO Payment Types

| Payment Type | Model | Amount | Lemon Squeezy Product Type |
|---|---|---|---|
| **Civic Retainer Subscription** | Recurring (monthly) | PKR 700/month | Subscription product |
| **Consultation Fee** | One-time | PKR 50,000 | One-time product |
| **Service Registration Fee** | One-time (variable) | Per-service fee | One-time product (custom_price) |

## Documentation Index

| Document | Description |
|---|---|
| [API Reference](./api-reference.md) | Complete API endpoints, objects, and patterns |
| [SDK Guide](./sdk-guide.md) | JavaScript SDK setup, functions, and usage |
| [Webhooks](./webhooks.md) | Webhook events, payload structure, signature verification |
| [Checkout Integration](./checkout-integration.md) | Creating checkouts for one-time and subscription payments |
| [Subscription Management](./subscription-management.md) | Subscription lifecycle, pausing, cancelling, plan changes |
| [AR-CO Integration Plan](./arco-integration-plan.md) | How Lemon Squeezy maps to AR-CO's payment flows |

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Next.js Web   │     │   NestJS API     │     │   Lemon Squeezy     │
│   (Frontend)    │     │   (Backend)      │     │   (Payment Provider) │
├─────────────────┤     ├──────────────────┤     ├─────────────────────┤
│ Checkout Button │────>│ Create Checkout  │────>│ Checkout API        │
│                 │     │ (POST /v1/       │     │ Returns checkout URL│
│                 │<────│  checkouts)      │<────│                     │
│ Redirect to     │     │                  │     │                     │
│ Checkout URL    │────>│                  │     │ Hosted/Overlay Page │
│                 │     │                  │     │                     │
│ Return URL      │<────│                  │<────│ Post-payment        │
│ (success/cancel)│     │                  │     │ redirect            │
│                 │     │                  │     │                     │
│                 │     │ Webhook Handler  │<────│ Webhook POST        │
│                 │     │ (POST /api/      │     │ (order_created,     │
│                 │     │  webhooks/       │     │  subscription_*,    │
│                 │     │  lemonsqueezy)   │     │  etc.)              │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

## Key Concepts

### Merchant of Record (MoR)
Lemon Squeezy acts as the seller on behalf of AR-CO. They handle:
- Tax calculation and remittance
- Payment processing (Stripe/PayPal under the hood)
- Refunds and chargebacks
- Compliance (PCI DSS, SCA, etc.)

### Test Mode
- Separate API keys for test vs. live mode
- Test mode data is isolated from production
- Use test mode during development; switch to live for production
- Test mode checkouts use test card numbers (e.g., `4242 4242 4242 4242`)

### JSON:API Format
All API responses follow JSON:API spec:
```json
{
  "data": {
    "type": "resource_type",
    "id": "1",
    "attributes": { ... },
    "relationships": { ... }
  }
}
```

### Rate Limiting
- **300 requests/minute** per API key
- Headers: `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`
- Exceeding returns `429 Too Many Requests`
