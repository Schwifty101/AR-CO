# Popup Checkout Design — Safepay Payment Integration

> Replaces the broken embedded zoid button with a popup-based checkout flow using the official Express Checkout redirect approach.

**Date:** 2026-02-15
**Status:** Approved
**Context:** `@sfpy/checkout-components` SDK is broken (React 19 incompatibility, Turbopack ESM mismatch, Safepay domain migration from `.com` to `.pk`). The official docs now describe Express Checkout as redirect-based only — no mention of zoid or embedded buttons.

---

## Problem

The embedded SafepayButton (zoid driver) fails for three compounding reasons:

1. **React 19** removed `ReactDOM.findDOMNode()`, which zoid's React driver calls in `componentDidMount`.
2. **Turbopack** treats `@sfpy/checkout-components` as ESM (package.json `"type": "module"`) but the dist is a UMD bundle with no `export` statements, so `require()`/`import` returns `{}`.
3. **Safepay domain migration**: `sandbox.api.getsafepay.com/button` returns 301 to `getsafepay.pk`, which zoid blocks because its domain regex only allows `.com`.

The SDK (v1.0.1) is the latest — last GitHub commit July 2024, no URL updates.

## Solution

Switch from the embedded zoid button to a **popup window** that opens Safepay's hosted checkout URL. The backend generates the URL using `@sfpy/node-core` (which still works). The popup follows redirects transparently. The overlay stays open throughout.

## Backend Changes

### New: `SafepayService.generateCheckoutUrl(trackerToken)`

1. Calls `safepay.auth.passport.create()` → short-lived TBT token
2. Calls `safepay.checkouts.payment.create()` with:
   - `tracker`: tracker token from `createPaymentSession`
   - `tbt`: auth token
   - `environment`: sandbox/production
   - `source`: `'popup'`
   - `redirect_url`: `{FRONTEND_URL}/consultation/payment-callback`
   - `cancel_url`: `{FRONTEND_URL}/consultation/payment-callback?cancelled=true`
3. Returns the checkout URL string

### Modified: `ConsultationsPaymentService.initiatePayment()`

After creating the payment session, also generates the checkout URL. Returns `checkoutUrl` instead of `publicKey`/`environment`.

### Updated: `PaymentSessionResult` interface

```
- Remove: publicKey (no longer needed by frontend)
+ Add: checkoutUrl (full Safepay checkout URL)
```

## Shared Schema Changes

`ConsultationPaymentInitResponseSchema` updated:

```
Remove: trackerToken, environment, publicKey
Add:    checkoutUrl (string URL)
Keep:   amount, currency, orderId (display only)
```

Response from `POST /api/consultations/:id/initiate-payment`:

```json
{
  "checkoutUrl": "https://sandbox.api.getsafepay.com/components?env=sandbox&beacon=track_xxx&...",
  "amount": 50000,
  "currency": "PKR",
  "orderId": "CON-2026-0009"
}
```

`trackerToken` stays server-side only (stored in `consultation_bookings` table). The tracker flows back through the payment callback redirect params.

## Frontend — Payment Callback Page

**New route:** `apps/web/app/consultation/payment-callback/page.tsx`

Minimal client component:

1. Reads URL query params: `tracker`, `sig`, `reference`, `order_id` (success) or `cancelled=true` (cancel)
2. Sends `postMessage` to parent (opener) window:
   - Success: `{ type: 'safepay-payment-success', tracker, reference, signature }`
   - Cancel: `{ type: 'safepay-payment-cancelled' }`
3. Calls `window.close()`
4. Shows "Processing..." or "You can close this window" fallback

Public page — no auth. Does zero verification (backend's job).

Not a webhook — this is a browser redirect URL configured in code via `redirect_url` param. No Safepay dashboard configuration needed.

## Frontend — Refactored ConsultationPaymentStep

**Remove entirely:**
- `@sfpy/checkout-components` package
- `apps/web/lib/safepay/safepay-button.ts`
- All zoid/findDOMNode shim code
- `next/dynamic` import for SafepayButton

**Replace with:**

1. Receives `checkoutUrl` from props (+ `amount`, `currency`, `referenceNumber` for display)
2. Renders styled "Pay with Safepay" button (our own)
3. On click: `window.open(checkoutUrl, ...)` centered popup ~500x700
4. Registers `message` event listener for `postMessage` from callback page
5. On `safepay-payment-success`: extracts tracker, calls `confirmPayment(bookingId, tracker)`, advances to Step 4
6. On `safepay-payment-cancelled`: toast, retry available
7. Polls `popupRef.closed` interval — detects manual close, shows retry

## Data Flow

```
Overlay (Step 3)                    Backend                         Safepay
     |                                 |                              |
     |-- POST /consultations/:id/      |                              |
     |   initiate-payment ------------>|                              |
     |                                 |-- session.setup() ---------->|
     |                                 |<-- tracker_token ------------|
     |                                 |-- passport.create() ------->|
     |                                 |<-- tbt_token ---------------|
     |                                 |-- checkouts.payment.create() |
     |                                 |-- Store tracker in DB        |
     |<-- { checkoutUrl, amount,       |                              |
     |      currency, orderId } -------|                              |
     |                                 |                              |
     | [User clicks "Pay with Safepay"]|                              |
     | window.open(checkoutUrl) -------|----------------------------->|
     |                                 |                              |
     |              [Popup: Safepay hosted checkout]                  |
     |              [User enters card, 3DS, payment]                  |
     |                                 |                              |
     |              [Safepay redirects popup to:]                     |
     |              /consultation/payment-callback?tracker=xxx&sig=yyy|
     |                                 |                              |
     | <-- postMessage({ type: 'safepay-payment-success', ... })      |
     | [Popup closes itself]           |                              |
     |                                 |                              |
     |-- POST /consultations/:id/      |                              |
     |   confirm-payment { tracker } ->|                              |
     |                                 |-- reporter.payments.fetch -->|
     |                                 |<-- state: PAID --------------|
     |                                 |-- Update booking: paid       |
     |<-- { status: 'paid' } ---------|                              |
     |                                 |                              |
     | [Advance to Step 4: Cal.com]    |                              |
```

## Error Handling

| Scenario | Handling |
|---|---|
| Popup blocked | Detect `window.open()` returning null. Toast: "Please allow popups" + retry |
| User closes popup early | Poll `popup.closed` interval. Show retry message |
| Safepay cancel redirect | Callback sends `safepay-payment-cancelled`. Toast + retry |
| `confirmPayment` network error | Toast error, keep button active for retry |
| Payment not confirmed yet | Toast: "Payment not yet confirmed" |
| TBT expired (1hr) | User retries → `initiatePayment` generates fresh session + URL |

## Files Changed

| File | Action |
|---|---|
| `apps/api/src/payments/safepay.service.ts` | Add `generateCheckoutUrl()` |
| `apps/api/src/consultations/consultations-payment.service.ts` | Call `generateCheckoutUrl()`, return `checkoutUrl` |
| `packages/shared/src/schemas/consultations.schemas.ts` | Update `ConsultationPaymentInitResponseSchema` |
| `packages/shared/src/types/consultations.types.ts` | Update derived type |
| `apps/web/app/consultation/payment-callback/page.tsx` | **New** — callback page |
| `apps/web/components/consultation/ConsultationPaymentStep.tsx` | Rewrite — popup + postMessage |
| `apps/web/lib/safepay/safepay-button.ts` | **Delete** |
| `apps/web/lib/api/consultations.ts` | Update return type |

**Package cleanup:** Uninstall `@sfpy/checkout-components` from `apps/web`.
