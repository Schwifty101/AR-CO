# Safepay Integration Reference

> Comprehensive reference for integrating Safepay payment gateway into the AR-CO law firm consultation booking system. Covers the backend SDK (`@sfpy/node-core`), popup-based checkout flow, sandbox testing, webhook verification, and the full payment sequence.
>
> **2026-02-15 UPDATE:** Switched from embedded zoid button (`@sfpy/checkout-components`) to popup-based Express Checkout. See [Domain Migration](#domain-migration-getsafepaycom--getsafepaypk) and [Why Not Embedded Button](#why-not-embedded-safepaybutton-zoid) below.

---

## Table of Contents

1. [Overview](#overview)
   - [Safepay Integration Types](#safepay-integration-types)
   - [Client-Side Libraries](#client-side-libraries)
2. [Package Installation and Versions](#package-installation-and-versions)
3. [Environment Configuration](#environment-configuration)
4. [Backend SDK Initialization](#backend-sdk-initialization)
5. [Payment Session Creation (v3 API)](#payment-session-creation-v3-api)
6. [Auth Token Generation (Passport/TBT)](#auth-token-generation-passporttbt)
7. [Customer Creation (Optional)](#customer-creation-optional)
8. [Payment Verification / Status Checking](#payment-verification--status-checking)
9. [Frontend SafepayButton Setup (React + Zoid)](#frontend-safepaybutton-setup-react--zoid)
10. [SafepayButton Props Reference](#safepaybutton-props-reference)
11. [Style Options](#style-options)
12. [Express Checkout Component Flow](#express-checkout-component-flow)
13. [Webhook Handling and HMAC Signature Verification](#webhook-handling-and-hmac-signature-verification)
    - [Webhook Payload Structure (v2.0.0)](#webhook-payload-structure-v200)
    - [Webhook Event Types](#webhook-event-types) (13 event types: payment, authorization, void, subscription)
    - [HMAC Signature Verification](#hmac-signature-verification) (**SHA-512 on full body**)
    - [NestJS Webhook Controller](#nestjs-webhook-controller)
    - [NestJS Raw Body Configuration](#nestjs-raw-body-configuration)
14. [Amount Format (Paisa Backend vs PKR Frontend)](#amount-format-paisa-backend-vs-pkr-frontend)
15. [Sandbox Test Cards and Testing Scenarios](#sandbox-test-cards-and-testing-scenarios)
16. [Error Handling Patterns](#error-handling-patterns)
17. [Payment Modes and Entry Modes](#payment-modes-and-entry-modes)
18. [Checkout URL Generation (Redirect Approach)](#checkout-url-generation-redirect-approach)
19. [Subscription Management](#subscription-management)
20. [Payment Flow for AR-CO Consultations](#payment-flow-for-ar-co-consultations)
21. [Backend Endpoints (AR-CO Specific)](#backend-endpoints-ar-co-specific)
22. [Key Notes and Gotchas](#key-notes-and-gotchas)
23. [External Resources](#external-resources)

---

## Overview

Safepay is a Pakistani payment gateway supporting card payments (Visa, Mastercard via CyberSource/MPGS processors) and wallet transactions. For the AR-CO consultation booking system, we use the **popup-based Express Checkout** approach: the backend generates a Safepay checkout URL, the frontend opens it in a popup window, and a callback page relays the result back to the overlay via `postMessage`.

**Our integration approach:**

- **Express Checkout** via `@sfpy/node-core` (backend SDK) — generates checkout URL, opens in popup
- **Popup window** — user stays on overlay page, Safepay checkout opens in a centered popup
- **Guest payments** — no Safepay account required for payers
- **Sandbox first** — all development and testing against sandbox environment
- **PKR 50,000** fixed consultation fee

### Domain Migration (getsafepay.com → getsafepay.pk)

As of early 2026, Safepay migrated their frontend-facing pages from `getsafepay.com` to `getsafepay.pk`. The **API endpoints** at `sandbox.api.getsafepay.com` still work for backend SDK calls (session creation, verification, webhooks). However, frontend-facing pages (`/button`, `/embedded`, `/components`) now 301 redirect to `getsafepay.pk`.

| What | Status |
|---|---|
| `sandbox.api.getsafepay.com` API endpoints | Working (backend SDK) |
| `sandbox.api.getsafepay.com/button` | 301 → `getsafepay.pk` (broken for iframes) |
| `sandbox.api.getsafepay.com/components` | 301 → `getsafepay.pk` (works in popup/redirect) |
| `sandbox.api.getsafepay.com/dashboard` | Working |
| `getsafepay.pk` | New Safepay homepage |

### Why Not Embedded SafepayButton (Zoid)

The `@sfpy/checkout-components` SDK (v1.0.1, latest) is broken for three reasons:

1. **React 19** removed `ReactDOM.findDOMNode()`, which zoid's React driver requires.
2. **Turbopack** (Next.js 16) treats the package as ESM (due to `"type": "module"` in package.json) but the dist is a UMD bundle with no `export` statements — `require()`/`import` returns `{}`.
3. **Domain migration**: zoid's domain regex only allows `.com`, blocks the `.pk` redirect.

The official Safepay docs (as of Feb 2026) no longer mention zoid or embedded buttons. Express Checkout is described as redirect-based only.

### Safepay Integration Types

| Aspect             | Express Checkout   | Advanced Checkout  |
| ------------------ | ------------------ | ------------------ |
| Integration Effort | Low                | Medium to High     |
| Server Requests    | 2 endpoints        | 3-5 endpoints      |
| 3DS Handling       | Managed by Safepay | Self-managed       |
| Tokenization       | Yes                | Yes                |
| Separate Capture   | Automatic          | Supported          |
| Best For           | Standard payments  | Custom checkout UI |

Both integration types support payments, tokenization for returning customers, zero-amount verification, and multiple payment entry modes.

### Client-Side Libraries

| Library                             | Platform                           | Use Case                               | Status (Feb 2026) |
| ----------------------------------- | ---------------------------------- | -------------------------------------- | --- |
| **Safepay Atoms**             | Web (JS, HTML, CSS)                | Advanced Checkout payer authentication | Active |
| **Safepay React Native**      | Mobile (React Native)              | Mobile app integration                 | Active |
| **Cardinal SDK**              | Native (Java, Kotlin, ObjC, Swift) | Native app 3DS                         | Active |
| **@sfpy/checkout-components** | Web (React/Vue/Angular)            | Express Checkout embedded button       | **Broken** (see above) |

**SDK packages:**

- `@sfpy/node-core` on the backend (NestJS) for payment session creation, auth tokens, checkout URL generation, verification, **webhook signature verification** — **this is the only SDK we use**
- ~~`@sfpy/checkout-components`~~ — **removed from project** (broken with React 19, Turbopack, and domain migration)

**Two alternative SDK packages exist but are NOT used:**

- `@sfpy/node-sdk` (v2.0.2) - higher-level wrapper with simpler API, but less control
- `safepay-sdk` / `safepay` (community) - unofficial packages, avoid

---

## Package Installation and Versions

### Backend Package

```bash
# Install in the API workspace
pnpm add @sfpy/node-core --filter api
```

| Package             | npm                                                           | Requirements  | Language        |
| ------------------- | ------------------------------------------------------------- | ------------- | --------------- |
| `@sfpy/node-core` | [@sfpy/node-core](https://www.npmjs.com/package/@sfpy/node-core) | Node.js >= 18 | 100% TypeScript |

This is the **official NodeJS Core SDK** for Safepay APIs. It provides:

- Payment session creation (`safepay.payments.session.setup()`)
- Auth token generation (`safepay.auth.passport.create()`)
- Payment verification (`safepay.payments.session.fetch()`)
- Customer creation (`safepay.user.customers.create()`)
- Checkout URL generation (`safepay.checkouts.payment.create()`)

### Frontend Package

```bash
# Install in the Web workspace
pnpm add @sfpy/checkout-components --filter web
```

| Package                       | npm                                                                               | Technology          | CDN                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------- |
| `@sfpy/checkout-components` | [@sfpy/checkout-components](https://www.npmjs.com/package/@sfpy/checkout-components) | zoid (iframe/popup) | `https://unpkg.com/@sfpy/checkout-components@0.1.0/dist/sfpy-checkout.js` |

This provides the `SafepayButton` component with drivers for:

- **React** (our choice) - via `safepay.Button.driver("react", { React, ReactDOM })`
- **Angular** - via `safepay.Button.driver("angular", { ... })`
- **Vue** - via `safepay.Button.driver("vue", { ... })`
- **Vanilla JS** - via `safepay.Button({ ... }).render("#container")`

### Alternative Higher-Level SDK (NOT used, for reference only)

```bash
# DO NOT install - for reference only
pnpm add @sfpy/node-sdk
```

The `@sfpy/node-sdk` (v2.0.2, MIT) is a simpler wrapper with methods like `safepay.payments.create()`, `safepay.checkout.create()`, `safepay.verify.signature()`, `safepay.verify.webhook()`. It initializes differently:

```typescript
// @sfpy/node-sdk (NOT our SDK - reference only)
import { Safepay } from '@sfpy/node-sdk';
const safepay = new Safepay({
  environment: 'sandbox',
  apiKey: 'sec_xxx',
  v1Secret: 'bar',
  webhookSecret: 'foo'
});
```

---

## Environment Configuration

### Environment URLs

| Environment          | API Host                               | Checkout Components Host                          | Dashboard                                        |
| -------------------- | -------------------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| **Sandbox**    | `https://sandbox.api.getsafepay.com` | `https://sandbox.api.getsafepay.com/components` | `https://sandbox.api.getsafepay.com/dashboard` |
| **Production** | `https://api.getsafepay.com`         | `https://www.getsafepay.com/components`         | `https://getsafepay.com/dashboard`             |

### Dashboard URLs

| Purpose       | Sandbox URL                                                          |
| ------------- | -------------------------------------------------------------------- |
| Login         | `https://sandbox.api.getsafepay.com/dashboard/login`               |
| API Keys      | `https://sandbox.api.getsafepay.com/dashboard/developers/api`      |
| Webhooks      | `https://sandbox.api.getsafepay.com/dashboard/developers/webhooks` |
| Payments List | `https://sandbox.api.getsafepay.com/dashboard/payments`            |

### Safepay API Keys

Safepay provides **3 distinguishable keys** from the dashboard:

| Key                                | Prefix     | Purpose                                                                           | Where Used         |
| ---------------------------------- | ---------- | --------------------------------------------------------------------------------- | ------------------ |
| **Public (Publishable) Key** | `pub_`   | Client-side transactions, SafepayButton `client` prop, payment session creation | Frontend + Backend |
| **Secret Key**               | `sec_`   | Server-side API authentication, SDK initialization                                | Backend ONLY       |
| **Webhook Secret Key**       | `whsec_` | Verify HMAC-SHA512 signatures on incoming webhooks                                | Backend ONLY       |

> **Security:** The Secret Key (`sec_xxx`) must NEVER reach the frontend. Only the Public Key (`pub_xxx`) is safe for client-side use.

**Where to find these keys:**

1. Log in to the Safepay dashboard (sandbox or production)
2. Navigate to **Developers > API** for the Public Key and Secret Key
3. Navigate to **Developers > Endpoints** > click **View shared secret** for the Webhook Secret Key

### Environment Variables

#### Safepay Sandbox Variables

For Safepay's sandbox environment, you'll typically need these environment variables:

| Variable                  | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `SAFE_PAY_ENVIRONMENT`  | Set to `sandbox` for test mode                             |
| `SAFE_PAY_PUBLIC_KEY`   | Your Sandbox public API key from the dashboard (`pub_xxx`) |
| `SAFE_PAY_SECRET_KEY`   | Your Sandbox secret API key from the dashboard (`sec_xxx`) |
| `SAFE_PAY_BASE_URL`     | `https://sandbox.api.getsafepay.com`                       |
| `SAFE_PAY_REDIRECT_URL` | The URL to redirect users to after test payment completion   |
| `SAFE_PAY_WEBHOOK_URL`  | Your local or public URL that receives test webhooks         |

> The Webhook Secret Key (`whsec_xxx`) is obtained separately from **Developers > Endpoints** in the dashboard.

#### AR-CO Project Variable Mapping

Our project maps the Safepay variables to these env var names:

**Backend (`apps/api/.env`):**

```env
# Safepay Configuration - 3 API Keys
SAFEPAY_SECRET_KEY=sec_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx    # = SAFE_PAY_SECRET_KEY (server-side ONLY, never expose)
SAFEPAY_MERCHANT_API_KEY=pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # = SAFE_PAY_PUBLIC_KEY (safe for client)
SAFEPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     # Webhook Secret Key (from Developers > Endpoints)

# Safepay Configuration - Environment & URLs
SAFEPAY_ENVIRONMENT=sandbox                                       # = SAFE_PAY_ENVIRONMENT ("sandbox" or "production")
SAFEPAY_HOST=https://sandbox.api.getsafepay.com                   # = SAFE_PAY_BASE_URL
SAFEPAY_REDIRECT_URL=https://arco.pk/consultation/success         # = SAFE_PAY_REDIRECT_URL
SAFEPAY_WEBHOOK_URL=https://your-domain.com/api/payments/webhook  # = SAFE_PAY_WEBHOOK_URL
```

| Safepay Standard          | AR-CO Backend                | AR-CO Frontend                       | Description                    |
| ------------------------- | ---------------------------- | ------------------------------------ | ------------------------------ |
| `SAFE_PAY_PUBLIC_KEY`   | `SAFEPAY_MERCHANT_API_KEY` | `NEXT_PUBLIC_SAFEPAY_MERCHANT_KEY` | Public key for client-side     |
| `SAFE_PAY_SECRET_KEY`   | `SAFEPAY_SECRET_KEY`       | N/A (never expose)                   | Secret key for server API auth |
| (Webhook Secret)          | `SAFEPAY_WEBHOOK_SECRET`   | N/A                                  | Webhook HMAC verification      |
| `SAFE_PAY_ENVIRONMENT`  | `SAFEPAY_ENVIRONMENT`      | `NEXT_PUBLIC_SAFEPAY_ENVIRONMENT`  | `sandbox` or `production`  |
| `SAFE_PAY_BASE_URL`     | `SAFEPAY_HOST`             | N/A                                  | API host URL                   |
| `SAFE_PAY_REDIRECT_URL` | `SAFEPAY_REDIRECT_URL`     | N/A                                  | Post-payment redirect          |
| `SAFE_PAY_WEBHOOK_URL`  | `SAFEPAY_WEBHOOK_URL`      | N/A                                  | Webhook endpoint URL           |

### NestJS Configuration (`apps/api/src/config/configuration.ts`)

```typescript
/** Safepay payment gateway configuration */
export interface SafepayConfig {
  /** Secret API key for backend SDK */
  secretKey: string;
  /** Public merchant API key for session creation and frontend */
  merchantApiKey: string;
  /** Current environment: 'sandbox' | 'production' */
  environment: string;
  /** HMAC secret for webhook signature verification */
  webhookSecret: string;
  /** API host URL based on environment */
  host: string;
}

// In the configuration factory:
safepay: {
  secretKey: process.env.SAFEPAY_SECRET_KEY,
  merchantApiKey: process.env.SAFEPAY_MERCHANT_API_KEY,
  environment: process.env.SAFEPAY_ENVIRONMENT || 'sandbox',
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
  host: process.env.SAFEPAY_ENVIRONMENT === 'production'
    ? 'https://api.getsafepay.com'
    : 'https://sandbox.api.getsafepay.com',
},
```

---

## Backend SDK Initialization

### CommonJS Pattern

```javascript
const safepay = require('@sfpy/node-core')('YOUR_SECRET_KEY', {
  authType: 'secret',
  host: 'https://sandbox.api.getsafepay.com'
});
```

### ES Module / TypeScript Pattern (Recommended)

```typescript
import Safepay from '@sfpy/node-core';

const safepay = new Safepay('YOUR_SECRET_KEY', {
  authType: 'secret',
  host: 'https://sandbox.api.getsafepay.com',
});
```

### Configuration Options

| Option       | Type                 | Default                          | Description                                                                              |
| ------------ | -------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `authType` | `'secret' \| 'jwt'` | Required                         | `'secret'` for server-side with API key. `'jwt'` for client-side with session token. |
| `host`     | `string`           | `'https://api.getsafepay.com'` | API endpoint URL. Use sandbox URL for testing.                                           |
| `timeout`  | `number`           | `80000`                        | Request timeout in milliseconds.                                                         |

### Auth Types Explained

- **`secret`** - Use on the backend. Initialize with your `sec_xxx` secret key. Has full API access.
- **`jwt`** - Use for client-side operations. Initialize with a temporary auth token from `safepay.auth.passport.create()`. Limited scope.

### NestJS Service Integration

```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Safepay from '@sfpy/node-core';

@Injectable()
export class SafepayService implements OnModuleInit {
  private readonly logger = new Logger(SafepayService.name);
  private safepay: InstanceType<typeof Safepay>;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const secretKey = this.configService.get<string>('safepay.secretKey');
    const host = this.configService.get<string>('safepay.host');

    this.safepay = new Safepay(secretKey, {
      authType: 'secret',
      host,
    });

    this.logger.log(`Safepay SDK initialized (host: ${host})`);
  }
}
```

---

## Payment Session Creation (v3 API)

The payment session (tracker) is the core object that represents a payment attempt. Creating a session is the first step before any checkout can begin.

### API Endpoint

```
POST /order/payments/v3/
```

### SDK Method

```typescript
const response = await safepay.payments.session.setup({
  merchant_api_key: 'pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  intent: 'CYBERSOURCE',
  mode: 'payment',
  entry_mode: 'raw',
  currency: 'PKR',
  amount: 5000000,  // PKR 50,000 in paisa (lowest denomination)
  user: 'cus_a7cc6fc1-088d-4f35-9dac-2bab2cb234a1',  // Optional: customer token
  metadata: {
    order_id: '1234567890',
    type: 'consultation',
    referenceId: 'booking-uuid-here',
  },
  include_fees: false,
});
```

### Parameters Reference

| Parameter            | Type        | Required | Description                                                                             |
| -------------------- | ----------- | -------- | --------------------------------------------------------------------------------------- |
| `merchant_api_key` | `string`  | Yes      | Your public/merchant API key (`pub_xxx`). NOT the secret key.                         |
| `intent`           | `string`  | Yes      | Payment processor:`'CYBERSOURCE'` or `'MPGS'`                                       |
| `mode`             | `string`  | Yes      | Payment mode:`'payment'`, `'instrument'`, `'subscription'`, `'unscheduled_cof'` |
| `entry_mode`       | `string`  | No       | Entry method:`'raw'` (standard checkout) or `'tms'` (saved card)                    |
| `currency`         | `string`  | Yes      | ISO currency code:`'PKR'` or `'USD'`                                                |
| `amount`           | `number`  | Yes      | Amount in**lowest denomination** (paisa for PKR, cents for USD). Integer.         |
| `user`             | `string`  | No       | Customer token (`cus_xxx`) for prefilling checkout info                               |
| `metadata`         | `object`  | No       | Custom JSON object for order tracking and webhook routing                               |
| `include_fees`     | `boolean` | No       | If `true`, MDR (merchant discount rate) fees are passed to the customer               |

### Response Structure

```typescript
interface SessionSetupResponse {
  data: {
    tracker: {
      token: string;          // "track_a323b3d5-c9e8-410f-9020-6f3a9395f13e"
      state: string;          // "TRACKER_STARTED"
      state_reason: string;   // ""
      created_at: string;     // ISO timestamp
      updated_at: string;     // ISO timestamp
      user: string;           // Customer token or ""
      billing: string;        // Billing info or ""
      client: string;         // Merchant API key
      environment: string;    // "sandbox" | "production"
      amount: number;         // Amount value
      currency: string;       // "PKR" | "USD"
      default_currency: string; // "PKR"
      conversion_rate: number;  // Exchange rate if applicable
      next_actions: unknown[];  // Processing instructions
    };
    purchase_totals: {
      quote: {
        amount: number;
        currency: string;
      };
      base: {
        amount: number;
        currency: string;
      };
      conversion_rate: number;
    };
  };
  status: {
    errors: string[];
    message: string;  // "success"
  };
}
```

### AR-CO Consultation Example

```typescript
/**
 * Creates a Safepay payment session for a consultation booking.
 *
 * @example
 * ```typescript
 * const session = await this.createPaymentSession('booking-uuid', 'cus_xxx');
 * // session.trackerToken = "track_xxx"
 * ```
 */
async createPaymentSession(
  bookingId: string,
  customerToken?: string,
): Promise<{ trackerToken: string; environment: string }> {
  const merchantApiKey = this.configService.get<string>('safepay.merchantApiKey');
  const environment = this.configService.get<string>('safepay.environment');

  const response = await this.safepay.payments.session.setup({
    merchant_api_key: merchantApiKey,
    intent: 'CYBERSOURCE',
    mode: 'payment',
    entry_mode: 'raw',
    currency: 'PKR',
    amount: 5000000, // PKR 50,000 = 5,000,000 paisa
    user: customerToken || undefined,
    metadata: {
      type: 'consultation',
      referenceId: bookingId,
    },
    include_fees: false,
  });

  const trackerToken = response.data.tracker.token;
  this.logger.log(`Payment session created: ${trackerToken} for booking ${bookingId}`);

  return { trackerToken, environment };
}
```

---

## Auth Token Generation (Passport/TBT)

After creating a payment session, you must generate a short-lived authentication token (TBT - Temporary Bearer Token) that authorizes the frontend to interact with Safepay's checkout UI.

### API Endpoint

```
POST /client/passport/v1/token
```

### SDK Method

```typescript
const response = await safepay.auth.passport.create();
```

### Response

```typescript
interface PassportResponse {
  data: string;  // The auth token string (e.g., "xnTyRgITVcHlyeKT2cf59_e836PouieQ6xPpuQiwFXD8M6HoJ283EP_zta2SKkm6B_IFNGEBmg==")
}
```

### Key Properties

| Property       | Value                                                            |
| -------------- | ---------------------------------------------------------------- |
| Token lifetime | **1 hour**                                                 |
| Scope          | Authorizes frontend checkout API requests                        |
| Regeneration   | Required per payment session. If expired, results in 401 errors. |
| Format         | Base64-encoded string                                            |

### Usage in AR-CO

The TBT token is used in two ways:

1. **Express Checkout (our approach):** Not directly used by SafepayButton - the button handles auth internally via the `client` prop.
2. **Redirect Checkout:** Passed as `tbt` parameter in the checkout URL construction.

For our embedded SafepayButton approach, the TBT is typically NOT needed because the button component handles authentication internally using the `client` (merchant API key) prop. However, if you need to construct a checkout URL (redirect flow), you would use it:

```typescript
const checkoutURL = safepay.checkouts.payment.create({
  tracker: trackerToken,
  tbt: authToken,         // The passport token
  environment: 'sandbox',
  source: 'hosted',
  redirect_url: 'https://arco.pk/success',
  cancel_url: 'https://arco.pk/cancel',
});
```

---

## Customer Creation (Optional)

Creating a customer before the payment session allows Safepay to prefill checkout fields (name, email, phone), improving the user experience for guest users.

### API Endpoint

```
POST /user/customers/create
```

### SDK Method

```typescript
const response = await safepay.user.customers.create({
  payload: {
    first_name: 'Ahmed',
    last_name: 'Raza',
    email: 'ahmed@example.com',
    phone_number: '+923331234567',
    country: 'PK',
    is_guest: true,
  },
});
```

### Parameters

| Parameter        | Type        | Required | Description                                              |
| ---------------- | ----------- | -------- | -------------------------------------------------------- |
| `first_name`   | `string`  | Yes      | Customer's first name                                    |
| `last_name`    | `string`  | Yes      | Customer's last name                                     |
| `email`        | `string`  | Yes      | Customer's email address                                 |
| `phone_number` | `string`  | No       | Phone in international format (e.g.,`+923331234567`)   |
| `country`      | `string`  | No       | ISO country code (e.g.,`'PK'`)                         |
| `is_guest`     | `boolean` | No       | `true` for guest customers (no Safepay account needed) |

### Response Structure

```typescript
interface CustomerCreateResponse {
  data: {
    token: string;            // "cus_a7cc6fc1-088d-4f35-9dac-2bab2cb234a1"
    merchant_api_key: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    country: string;
    is_guest: boolean;
    created_at: string;       // ISO timestamp
    updated_at: string;       // ISO timestamp
  };
}
```

### AR-CO Usage

```typescript
/**
 * Creates a Safepay guest customer for checkout prefilling.
 * Called before payment session creation if guest info is available.
 *
 * @example
 * ```typescript
 * const customerToken = await this.createCustomer({
 *   firstName: 'Ahmed', lastName: 'Raza',
 *   email: 'ahmed@example.com', phone: '+923331234567',
 * });
 * // customerToken = "cus_a7cc6fc1-..."
 * ```
 */
async createCustomer(guest: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}): Promise<string> {
  const response = await this.safepay.user.customers.create({
    payload: {
      first_name: guest.firstName,
      last_name: guest.lastName,
      email: guest.email,
      phone_number: guest.phone || '',
      country: 'PK',
      is_guest: true,
    },
  });

  return response.data.token; // "cus_xxx"
}
```

Then pass the customer token when creating the payment session:

```typescript
const session = await safepay.payments.session.setup({
  // ... other params
  user: customerToken, // Links guest info to this payment
});
```

---

## Payment Verification / Status Checking

After a payment completes (either via `onPayment` callback or webhook), always verify the payment server-side before updating your records.

### API Endpoint

```
GET /reporter/api/v1/payments/{tracker_token}
```

### SDK Methods

There are two SDK methods for fetching payment status:

```typescript
// Method 1: Reporter API (recommended for verification)
const payment = await safepay.reporter.payments.get(trackerToken);

// Method 2: Session fetch (alternative)
const payment = await safepay.payments.session.fetch(trackerToken);
```

> **Note:** `safepay.reporter.payments.get()` is the method used in Safepay's official Express Checkout documentation for status verification after redirect. Both methods query the same underlying API.

### Response Fields

```typescript
interface PaymentStatusResponse {
  data: {
    tracker: {
      token: string;       // "track_xxx"
      state: string;       // Tracker state (see states below)
      state_reason: string;
    };
    reference: string;     // Safepay transaction reference (e.g., "969025")
    intent: string;        // "CYBERSOURCE"
    fee: number;           // Transaction fee amount
    net: number;           // Amount after fees
    user: string;          // Customer token
    amount: number;        // Transaction amount
    currency: string;      // "PKR" | "USD"
    metadata: object;      // Custom metadata passed during session creation
  };
}
```

### Payment/Tracker States

| State                  | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `TRACKER_STARTED`    | Session created, awaiting payment                   |
| `TRACKER_PROCESSING` | Payment is being processed                          |
| `TRACKER_COMPLETED`  | Payment completed successfully                      |
| `TRACKER_FAILED`     | Payment failed (declined, insufficient funds, etc.) |
| `TRACKER_ENDED`      | Session ended (expired or completed)                |
| `CANCELLED`          | Payment was cancelled by user                       |

> **Note:** The official Express Checkout docs reference `TRACKER_COMPLETED` and `TRACKER_FAILED` as the primary success/failure states. The `PAID` state may also appear in webhook data. Check for both `TRACKER_COMPLETED` and `PAID` when verifying success.

### AR-CO Verification Pattern

```typescript
/**
 * Verifies a payment and returns the status.
 * ALWAYS call this server-side before updating booking status.
 *
 * @example
 * ```typescript
 * const result = await this.verifyPayment('track_xxx');
 * if (result.isPaid) {
 *   await this.updateBookingStatus(bookingId, 'paid');
 * }
 * ```
 */
async verifyPayment(trackerToken: string): Promise<{
  isPaid: boolean;
  reference: string;
  amount: number;
  state: string;
}> {
  const payment = await this.safepay.reporter.payments.get(trackerToken);
  const state = payment.data.tracker.state;

  return {
    isPaid: state === 'TRACKER_COMPLETED' || state === 'PAID',
    reference: payment.data.reference,
    amount: payment.data.amount,
    state,
  };
}
```

---

## Frontend Popup Checkout Setup

> **Note:** This section replaces the previous "Frontend SafepayButton Setup (React + Zoid)" section. The embedded zoid approach is no longer viable. See [Why Not Embedded SafepayButton](#why-not-embedded-safepaybutton-zoid).

The popup checkout approach uses only the backend `@sfpy/node-core` SDK to generate a checkout URL. The frontend opens it in a popup window and receives the result via `postMessage`.

### Backend: Generate Checkout URL

```typescript
// In SafepayService
async generateCheckoutUrl(trackerToken: string): Promise<string> {
  const authResponse = await this.safepay.auth.passport.create();
  const tbt = authResponse.data;

  return this.safepay.checkouts.payment.create({
    tracker: trackerToken,
    tbt,
    environment: this.environment,
    source: 'popup',
    redirect_url: `${this.frontendUrl}/consultation/payment-callback`,
    cancel_url: `${this.frontendUrl}/consultation/payment-callback?cancelled=true`,
  });
}
```

### Frontend: Payment Callback Page

```tsx
// apps/web/app/consultation/payment-callback/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentCallbackPage() {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get('cancelled')) {
      window.opener?.postMessage({ type: 'safepay-payment-cancelled' }, '*');
    } else {
      window.opener?.postMessage({
        type: 'safepay-payment-success',
        tracker: params.get('tracker'),
        reference: params.get('ref'),
        signature: params.get('sig'),
      }, '*');
    }
    window.close();
  }, [params]);

  return <p>Processing payment... You can close this window.</p>;
}
```

### Frontend: Open Popup and Listen for Result

```tsx
// In ConsultationPaymentStep component
const handlePayClick = () => {
  const popup = window.open(
    checkoutUrl,
    'safepay-checkout',
    'width=500,height=700,left=...,top=...',
  );

  if (!popup) {
    toast.error('Please allow popups for this site');
    return;
  }

  // Listen for result from callback page
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'safepay-payment-success') {
      window.removeEventListener('message', handler);
      confirmPayment(bookingId, event.data.tracker);
    }
    if (event.data?.type === 'safepay-payment-cancelled') {
      window.removeEventListener('message', handler);
      toast.error('Payment cancelled');
    }
  };
  window.addEventListener('message', handler);

  // Detect manual popup close
  const interval = setInterval(() => {
    if (popup.closed) {
      clearInterval(interval);
      window.removeEventListener('message', handler);
    }
  }, 500);
};
```

### Redirect Callback Data

After payment, Safepay redirects to the callback URL with these query params:

| Param | Description |
|---|---|
| `tracker` | Payment tracker token (`track_xxx`) |
| `sig` | HMAC signature for verification |
| `ref` | Safepay transaction reference |
| `order_id` | Your original order ID |

On cancel, redirects to: `callback_url?cancelled=true`

---

## Express Checkout Popup Flow

This section describes the complete flow using the popup-based Express Checkout (our chosen method).

### Flow

```
1. User reaches Step 3 of consultation overlay
2. Frontend calls POST /api/consultations/:id/initiate-payment
3. Backend creates payment session via safepay.payments.session.setup()
   - Stores tracker token in consultation_bookings table
4. Backend generates auth token via safepay.auth.passport.create()
5. Backend generates checkout URL via safepay.checkouts.payment.create()
   - Includes tracker, tbt, redirect_url, cancel_url
6. Backend returns { checkoutUrl, amount, currency, orderId } to frontend
7. User clicks "Pay with Safepay" button
8. Frontend opens checkoutUrl in a centered popup window
9. User completes payment on Safepay's hosted checkout (card entry, 3DS)
10. Safepay redirects popup to /consultation/payment-callback?tracker=xxx&sig=yyy
11. Callback page sends postMessage to parent window with tracker data
12. Callback page closes itself
13. Frontend receives postMessage, calls POST /confirm-payment with tracker
14. Backend verifies via safepay.reporter.payments.fetch(tracker)
15. Backend updates booking status to 'paid'
16. Frontend advances to Step 4 (Cal.com scheduling)
```

---

## Webhook Handling and HMAC Signature Verification

Safepay sends webhook notifications for payment and subscription events. Webhooks are essential because:

- The `onPayment` callback may not fire (user closes browser)
- Frontend callbacks can be tampered with
- Webhooks provide server-to-server confirmation

### Webhook Setup in Safepay Dashboard

1. Log in to the Safepay sandbox dashboard
2. Navigate to **Developers > Endpoints**
3. Add your webhook endpoint URL: `https://your-domain.com/api/payments/webhook`
4. Enable the events you want to receive
5. Click **View shared secret** and copy the key for signature verification

> **Key Rotation:** When rotating webhook secrets, temporarily accept signatures from both the old and new key. Propagation takes time and queued webhooks may still use the previous signing key.

### Webhook Payload Structure (v2.0.0)

```typescript
interface SafepayWebhookPayload {
  /** Event type (dot-separated, e.g., "payment.succeeded") */
  type: SafepayWebhookEventType;
  /** Webhook schema version */
  version: '2.0.0';
  /** Event-specific data (structure depends on event type) */
  data: SafepayWebhookData;
  /** Number of delivery attempts */
  delivery_attempts: number;
  /** Next retry timestamp (if delivery failed) */
  next_attempt_at: string | null;
}

/** Payment event data (for payment.succeeded, payment.failed, payment.refunded) */
interface SafepayPaymentWebhookData {
  /** Payment tracker token */
  tracker: string;
  /** Transaction amount */
  amount: number;
  /** Currency code */
  currency: string;
  /** Customer email */
  email: string;
  /** Net amount after fees */
  net: number;
  /** Transaction fee charged */
  fee: number;
  /** Capture/event timestamp */
  captured_at?: string;
  /** Your custom metadata */
  metadata: {
    type: string;        // "consultation" | "subscription" | etc.
    referenceId: string; // Your booking/order ID
    [key: string]: unknown;
  };
}

/** Authorization event data */
interface SafepayAuthorizationWebhookData {
  /** Authorization ID */
  authorization_id: string;
  /** Authorization amount */
  amount: number;
  /** Authorization timestamp */
  authorized_at: string;
}

/** Subscription event data */
interface SafepaySubscriptionWebhookData {
  /** Subscription plan ID */
  plan_id: string;
  /** Billing cycle start date */
  billing_cycle_start: string;
  /** Billing cycle end date */
  billing_cycle_end: string;
  /** Current cycle number */
  cycle_count: number;
  /** Subscription status */
  status: string;
}
```

### Webhook Event Types

Safepay uses **dot-separated** event type names (NOT colon-separated).

#### Payment Events

| Event Type            | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| `payment.succeeded` | Payment has been successfully captured                                           |
| `payment.failed`    | Payment processing encountered an error (includes error category, code, message) |
| `payment.refunded`  | A refund has been processed (includes refund amount and remaining balance)       |

#### Authorization Events

| Event Type                  | Description                                             |
| --------------------------- | ------------------------------------------------------- |
| `authorization.succeeded` | Card authorization completed successfully               |
| `authorization.reversed`  | A previously successful authorization has been reversed |

#### Void Events

| Event Type         | Description                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| `void.succeeded` | A capture or refund has been voided (specifies void type:`CAPTURE` or `REFUND`) |

#### Subscription Events

| Event Type                         | Description                                                             |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `subscription.created`           | Customer enrolled in a recurring payment plan                           |
| `subscription.canceled`          | Subscription has been cancelled                                         |
| `subscription.ended`             | All billing cycles completed successfully                               |
| `subscription.paused`            | Subscription payments temporarily halted                                |
| `subscription.resumed`           | A paused subscription has been restarted                                |
| `subscription.payment.succeeded` | A billing cycle payment succeeded (includes transaction ID, cycle info) |
| `subscription.payment.failed`    | A billing cycle payment failed (includes error code and message)        |

> **Important:** The older `payment:created` event type (colon-separated) is from the legacy v1 webhook schema. The current v2.0.0 schema uses dot-separated names as listed above.

### HMAC Signature Verification

Safepay signs webhook payloads using **HMAC-SHA512**. The signature is sent in the `X-SFPY-SIGNATURE` header.

> **CRITICAL CORRECTION:** Previous versions of this document incorrectly stated SHA-256 on the tracker token. The actual algorithm is **SHA-512** on the **full JSON-encoded request body**.

#### How the Signature is Generated

Safepay computes: `HMAC-SHA512(json_encoded_body, webhook_secret)` where:

- **Message:** The full raw JSON request body (as a Buffer)
- **Key:** Your shared secret from the dashboard (Developers > Endpoints > View shared secret)
- **Algorithm:** SHA-512
- **Output:** Hex-encoded digest

#### Recommended: Using @sfpy/node-core Built-in Verification

The `@sfpy/node-core` SDK provides a built-in method for webhook verification:

```typescript
import Safepay from '@sfpy/node-core';

const safepay = new Safepay('SAFEPAY_SECRET_KEY', {
  authType: 'secret',
  host: 'https://sandbox.api.getsafepay.com',
});

const webhookSecret = 'your-endpoint-secret';
const payload = req.body; // raw request body
const signature = req.headers['x-sfpy-signature'];

try {
  const event = safepay.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret,
  );

  // event.type is the webhook event type
  // event.data contains the event-specific data
  switch (event.type) {
    case 'payment.succeeded':
      // Handle successful payment
      break;
    case 'payment.failed':
      // Handle failed payment
      break;
  }
} catch (err) {
  console.log(`Webhook verification failed: ${err.message}`);
  // Return 400 to indicate invalid signature
}
```

#### Manual Node.js Verification Implementation

If you need to verify manually (without the SDK helper):

```typescript
import * as crypto from 'crypto';

/**
 * Verifies the HMAC-SHA512 signature on a Safepay webhook request.
 * The signature is computed over the full JSON-encoded request body.
 *
 * @example
 * ```typescript
 * const isValid = verifySafepaySignature(
 *   req.body,  // raw request body
 *   request.headers['x-sfpy-signature'],
 *   process.env.SAFEPAY_WEBHOOK_SECRET,
 * );
 * ```
 */
function verifySafepaySignature(
  payload: unknown,
  receivedSignature: string,
  webhookSecret: string,
): boolean {
  // Step 1: Convert body to JSON-encoded Buffer
  const data = Buffer.from(JSON.stringify(payload));

  // Step 2: Compute HMAC-SHA512
  const computedSignature = crypto
    .createHmac('sha512', webhookSecret)
    .update(data)
    .digest('hex');

  // Step 3: Compare using timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex'),
    );
  } catch {
    // Lengths don't match
    return false;
  }
}
```

> **Important:** Always use the **raw** request body for signature calculation. If your framework parses the body as JSON, you must re-serialize it or capture the raw body before parsing. In NestJS, use a raw body middleware or `rawBody: true` option.

#### Alternative: Using @sfpy/node-sdk Verification (Reference)

If using the `@sfpy/node-sdk` package (not our primary SDK), it has built-in verification:

```typescript
// @sfpy/node-sdk pattern (reference only)
const valid = safepay.verify.signature(request);
const validWebhook = await safepay.verify.webhook(request);
```

### NestJS Webhook Controller

```typescript
import { Controller, Post, Req, Headers, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import Safepay from '@sfpy/node-core';

@Controller('payments')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);
  private safepay: InstanceType<typeof Safepay>;

  constructor(private readonly configService: ConfigService) {
    this.safepay = new Safepay(
      this.configService.get<string>('safepay.secretKey'),
      {
        authType: 'secret',
        host: this.configService.get<string>('safepay.host'),
      },
    );
  }

  /**
   * Receives Safepay webhook notifications.
   * Verifies HMAC signature via SDK, then routes to the appropriate service
   * based on event type and metadata.
   */
  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-sfpy-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const webhookSecret = this.configService.get<string>('safepay.webhookSecret');

    // Verify signature using SDK's built-in method
    let event: SafepayWebhookPayload;
    try {
      event = this.safepay.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.warn(`Invalid webhook signature: ${err.message}`);
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    const { type, data } = event;
    this.logger.log(`Webhook received: ${type}`);

    // Route based on event type
    switch (type) {
      case 'payment.succeeded':
        await this.handlePaymentSucceeded(data);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(data);
        break;
      case 'payment.refunded':
        await this.handlePaymentRefunded(data);
        break;
      case 'subscription.payment.succeeded':
        await this.handleSubscriptionPayment(data);
        break;
      case 'subscription.payment.failed':
        await this.handleSubscriptionPaymentFailed(data);
        break;
      case 'subscription.canceled':
      case 'subscription.ended':
        await this.handleSubscriptionEnded(data);
        break;
      default:
        this.logger.log(`Unhandled webhook event type: ${type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(data: SafepayPaymentWebhookData): Promise<void> {
    const metadata = data.metadata;
    switch (metadata?.type) {
      case 'consultation':
        await this.consultationsService.handlePaymentConfirmed(data.tracker, data);
        break;
      case 'service':
        await this.serviceRegistrationsService.handlePaymentEvent(data.tracker, data);
        break;
      case 'invoice':
        await this.invoicesService.handlePaymentEvent(data.tracker, data);
        break;
      default:
        this.logger.warn(`Unknown metadata type in payment.succeeded: ${metadata?.type}`);
    }
  }
}
```

### NestJS Raw Body Configuration

To ensure webhook signature verification works correctly, enable raw body parsing in NestJS:

```typescript
// apps/api/src/main.ts
const app = await NestFactory.create(AppModule, {
  rawBody: true, // Required for webhook HMAC verification
});
```

Then access the raw body in the controller:

```typescript
// Access raw body for signature verification
@Req() req: RawBodyRequest<Request>
// req.rawBody contains the unparsed Buffer
```

### Webhook Retry Behavior

- Safepay expects a **2xx HTTP status code** in response
- If not received in a timely manner, Safepay retries
- Retries continue for up to **24 hours** after the originating event
- `delivery_attempts` field tracks retry count
- `next_attempt_at` shows the scheduled retry time

### Callback Signature Verification (onPayment)

The `onPayment` callback also includes a `signature` field. This callback signature uses HMAC on the tracker token (different from webhook verification which uses the full body):

```typescript
// When the frontend sends the onPayment data to your backend:
const { tracker, signature } = paymentCallbackData;

// Note: Callback signatures may use a different HMAC scheme than webhooks.
// Always verify payment server-side using safepay.reporter.payments.get(tracker)
// as the primary verification method, rather than relying solely on signature checks.
const payment = await safepay.reporter.payments.get(tracker);
if (payment.data.tracker.state !== 'TRACKER_COMPLETED') {
  throw new HttpException('Payment not completed', HttpStatus.BAD_REQUEST);
}
```

> **Best Practice:** Rather than manually verifying the callback signature, always use `safepay.reporter.payments.get(tracker)` to fetch the authoritative payment status from Safepay's servers. This is the most reliable verification method.

---

## Amount Format (Paisa Backend vs PKR Frontend)

This is a **critical difference** that causes bugs if not handled correctly.

### Backend: Lowest Denomination (Paisa)

The `@sfpy/node-core` SDK and all Safepay API endpoints expect amounts in the **lowest denomination**:

- **PKR:** Amount in paisa (1 PKR = 100 paisa)
- **USD:** Amount in cents (1 USD = 100 cents)

```typescript
// Backend: PKR 50,000 consultation fee
const amount = 5000000; // 50,000 * 100 = 5,000,000 paisa

await safepay.payments.session.setup({
  amount: 5000000,  // paisa
  currency: 'PKR',
  // ...
});
```

### Frontend: Major Currency Unit (PKR)

The `@sfpy/checkout-components` SafepayButton `payment` prop expects amounts in the **major currency unit**:

```tsx
// Frontend: PKR 50,000 consultation fee
<SafepayButton
  payment={{
    currency: 'PKR',
    amount: 50000,  // PKR (NOT paisa)
  }}
  // ...
/>
```

### Conversion Helper

```typescript
/** Converts PKR amount to paisa for Safepay backend API */
export function pkrToPaisa(pkr: number): number {
  return Math.round(pkr * 100);
}

/** Converts paisa amount to PKR for display */
export function paisaToPkr(paisa: number): number {
  return paisa / 100;
}

// Usage:
const CONSULTATION_FEE_PKR = 50000;
const backendAmount = pkrToPaisa(CONSULTATION_FEE_PKR); // 5000000
```

### Summary Table

| Context                                        | Amount for PKR 50,000 | Unit            | Example            |
| ---------------------------------------------- | --------------------- | --------------- | ------------------ |
| `safepay.payments.session.setup({ amount })` | `5000000`           | Paisa           | Backend API        |
| `POST /order/payments/v3/` body `amount`   | `5000000`           | Paisa           | Direct API         |
| `POST /order/v1/init` body `amount`        | `50000`             | PKR (legacy v1) | Legacy API         |
| `<SafepayButton payment={{ amount }}>`       | `50000`             | PKR             | Frontend component |
| Webhook `notification.amount`                | `5000000`           | Paisa           | Webhook payload    |
| Dashboard display                              | `50,000`            | PKR             | Visual display     |

> **Note:** The legacy `/order/v1/init` endpoint uses PKR (major unit) for amount, while the v3 `/order/payments/v3/` endpoint uses paisa (lowest denomination). We use v3.

---

## Sandbox Test Cards and Testing Scenarios

### Sandbox Environment

- **Sandbox dashboard:** `https://sandbox.api.getsafepay.com/dashboard/login`
- **Sandbox API host:** `https://sandbox.api.getsafepay.com`
- All transactions in sandbox are simulated - no real money moves
- Sandbox and production have separate API keys

### Test Card Numbers

Safepay uses CyberSource and MPGS as payment processors. Test cards work with their respective 3DS emulators.

**CyberSource Test Cards:**

| Card Type  | Card Number          | Notes                           |
| ---------- | -------------------- | ------------------------------- |
| Visa       | `4000000000001091` | Standard test card with 3DS     |
| Visa       | `4111111111111111` | Standard Visa test number       |
| Visa       | `4000000000001000` | Standard test card              |
| Mastercard | `5200000000001096` | Standard test card with 3DS     |
| Mastercard | `5200000000001005` | Standard test card              |
| Mastercard | `5555555555554444` | Standard Mastercard test number |

**Card Details for Testing:**

| Field           | Value                                         |
| --------------- | --------------------------------------------- |
| Expiry Date     | Any**future** date (e.g., `12/2028`)  |
| CVV             | Any 3-digit number for Visa/MC (e.g.,`123`) |
| Cardholder Name | Any name                                      |

### 3D Secure (3DS) Testing

When test cards trigger 3DS, Safepay redirects to a **3DS emulator** page where you can simulate various payer authentication flows and payment failure scenarios:

- **Approve** the authentication (simulates successful 3DS)
- **Reject** the authentication (simulates failed 3DS)
- **Cancel** (simulates user abandoning 3DS)

#### ECI Values (Electronic Commerce Indicator)

After 3DS authentication, the ECI value indicates the authentication level:

| ECI Value      | Meaning                        |
| -------------- | ------------------------------ |
| `01`, `06` | Authentication attempted       |
| `02`, `05` | Successful authentication      |
| `07`         | Card cannot be enrolled in 3DS |

#### PARes Status Codes (Payer Authentication Response)

| Status | Meaning                           |
| ------ | --------------------------------- |
| `Y`  | Successful authentication         |
| `N`  | Failed or canceled authentication |
| `U`  | Incomplete authentication         |
| `A`  | Attempt indicator                 |
| `B`  | Bypass indicator                  |

These values are visible on the sandbox dashboard payment detail page, useful for debugging 3DS authentication issues.

### Testing Limitations

- **Daily limit:** You cannot use the same dummy card number and email more than **7-8 times per day**
- **Email variation:** Use different email addresses for repeated tests (e.g., `test1@example.com`, `test2@example.com`)
- **Do NOT use real cards** in sandbox even though it is simulated

### Testing Scenarios Checklist

| Scenario                   | How to Test                              | Expected Result                           |
| -------------------------- | ---------------------------------------- | ----------------------------------------- |
| Successful payment         | Use test card, approve 3DS               | `onPayment` fires, state = `PAID`     |
| 3DS authentication failure | Reject on 3DS emulator                   | Payment fails, state =`FAILED`          |
| User cancellation          | Close checkout iframe                    | `onCancel` fires                        |
| Expired session            | Wait for session timeout                 | Checkout becomes unavailable              |
| Webhook delivery           | Make a payment, check server logs        | Webhook received with `payment:created` |
| Signature verification     | Verify HMAC on webhook                   | Signature matches                         |
| Amount verification        | Check backend amount vs frontend display | Backend: paisa, Frontend: PKR             |

### Viewing Test Payments

After testing, view captured payment data on the sandbox dashboard:

1. Go to `https://sandbox.api.getsafepay.com/dashboard/login`
2. Navigate to **Payments** section
3. View transaction details, authentication status, and payment states

---

## Error Handling Patterns

### SDK Error Handling

All `@sfpy/node-core` async operations return promises. Use try/catch:

```typescript
try {
  const response = await safepay.payments.session.setup({
    merchant_api_key: merchantApiKey,
    intent: 'CYBERSOURCE',
    mode: 'payment',
    currency: 'PKR',
    amount: 5000000,
  });
  return response.data.tracker.token;
} catch (error) {
  // error.response.data.error contains Safepay error details
  this.logger.error(`Safepay session creation failed: ${error.message}`, error.stack);
  throw new HttpException(
    'Payment session creation failed. Please try again.',
    HttpStatus.BAD_GATEWAY,
  );
}
```

### Common Error Scenarios

| Error                | Cause                                                            | Resolution                               |
| -------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| `401 Unauthorized` | Invalid API key or expired auth token                            | Check API key; regenerate passport token |
| `400 Bad Request`  | Invalid parameters (wrong amount format, missing required field) | Validate inputs before calling SDK       |
| `404 Not Found`    | Invalid tracker token                                            | Verify tracker token exists in your DB   |
| `500 Server Error` | Safepay internal error                                           | Retry with exponential backoff           |
| `ECONNREFUSED`     | Wrong host URL                                                   | Verify sandbox/production host URL       |
| `ETIMEDOUT`        | Network timeout                                                  | Check connectivity; increase timeout     |

### Auth Token Expiry

The passport/TBT token expires after **1 hour**. If you get a 401 error during checkout URL generation, regenerate:

```typescript
// Detect token expiry and regenerate
try {
  const checkoutUrl = safepay.checkouts.payment.create({ tbt: cachedToken, ... });
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired, regenerate
    const newToken = await safepay.auth.passport.create();
    const checkoutUrl = safepay.checkouts.payment.create({ tbt: newToken.data, ... });
  }
}
```

### Frontend Error Handling

```tsx
<SafepayButton
  // ... props
  onPayment={async (data) => {
    try {
      const response = await fetch(`/api/consultations/${bookingId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracker: data.tracker, signature: data.signature }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Payment verification failed');
        return;
      }

      toast.success('Payment confirmed! Proceeding to scheduling...');
      onPaymentSuccess(data);
    } catch (err) {
      toast.error('Network error. Please contact support.');
      console.error('Payment confirmation error:', err);
    }
  }}
  onCancel={() => {
    toast.info('Payment cancelled. You can try again.');
  }}
/>
```

### Retry Pattern for Backend Calls

```typescript
/**
 * Retries a Safepay SDK call with exponential backoff.
 * @param fn - Async function to retry
 * @param maxRetries - Maximum retry attempts (default: 3)
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage:
const session = await withRetry(() =>
  safepay.payments.session.setup({ ... }),
);
```

---

## Payment Modes and Entry Modes

### Payment Modes (`mode` parameter)

| Mode                | Description                                  | Use Case                                          |
| ------------------- | -------------------------------------------- | ------------------------------------------------- |
| `payment`         | Regular one-time payment as a guest user     | **Our primary use case** - consultation fee |
| `instrument`      | Save a payment method to a customer's wallet | Card-on-file for recurring clients                |
| `subscription`    | Recurring payments with a saved card         | Subscription plans                                |
| `unscheduled_cof` | Merchant-initiated payment using saved card  | Invoice payments, auto-billing                    |

**Deprecated modes (avoid):**

- `cof` (card-on-file) - replaced by `instrument` + `tms` entry mode
- `payment-raw` - replaced by `payment` + `raw` entry mode

### Entry Modes (`entry_mode` parameter)

| Entry Mode | Description                                      | Use Case                                                   |
| ---------- | ------------------------------------------------ | ---------------------------------------------------------- |
| `raw`    | Full card entry form (standard checkout)         | **Our primary use case** - guest enters card details |
| `tms`    | Token Management Service (saved payment methods) | Returning clients with saved cards                         |

### Intent Values (`intent` parameter)

| Intent          | Processor                           | Description                                                  |
| --------------- | ----------------------------------- | ------------------------------------------------------------ |
| `CYBERSOURCE` | CyberSource (Visa)                  | **Primary processor** - supports Visa, Mastercard, 3DS |
| `MPGS`        | Mastercard Payment Gateway Services | Alternative processor                                        |

**For AR-CO:** Use `intent: 'CYBERSOURCE'` as the default. It supports both Visa and Mastercard.

---

## Checkout URL Generation (Redirect Approach)

> **Note:** This section documents the redirect-based checkout for reference. Our primary integration uses the embedded SafepayButton (no redirects). However, this may be useful as a fallback or for email-based payment links.

### SDK Method

```typescript
const checkoutURL = safepay.checkouts.payment.create({
  tracker: 'track_a323b3d5-c9e8-410f-9020-6f3a9395f13e',
  tbt: 'xnTyRgITVcHlyeKT2cf59_xxxxx',  // Auth token from passport
  environment: 'sandbox',
  source: 'hosted',         // 'hosted' | 'popup' | 'mobile' | 'woocommerce' | 'shopify'
  user_id: 'cus_xxx',       // Optional: customer token for prefill
  redirect_url: 'https://arco.pk/consultation/success',
  cancel_url: 'https://arco.pk/consultation/cancel',
});

// Returns a URL string like:
// https://sandbox.api.getsafepay.com/components?env=sandbox&beacon=track_xxx&...
```

### Source Values

| Source          | Description                   |
| --------------- | ----------------------------- |
| `hosted`      | Standard hosted checkout page |
| `popup`       | Popup window checkout         |
| `mobile`      | Mobile SDK checkout           |
| `woocommerce` | WooCommerce plugin            |
| `shopify`     | Shopify plugin                |

### Redirect Callback

After payment, the user is redirected to `redirect_url` with the tracker token appended:

```
https://arco.pk/consultation/success?tracker=track_a323b3d5-c9e8-410f-9020-6f3a9395f13e&sig=abc123
```

Query parameters:

- `tracker` - The payment tracker token
- `sig` / `signature` - HMAC signature for verification
- `ref` / `reference` - Safepay transaction reference
- `order_id` - Your original order ID

### Legacy Checkout URL (v1)

The older API uses query parameters directly:

```
https://sandbox.api.getsafepay.com/components
  ?env=sandbox
  &beacon=track_xxx
  &source=magento
  &order_id=12345
  &redirect_url=https://example.com/success
  &cancel_url=https://example.com/cancel
```

---

## Subscription Management

> **Note:** Subscription management is for future AR-CO features (subscription plans). Documented here for completeness.

### Using @sfpy/node-sdk (Higher-Level SDK)

```typescript
import { Safepay } from '@sfpy/node-sdk';

const safepay = new Safepay({
  environment: 'sandbox',
  apiKey: 'sec_xxx',
  v1Secret: 'bar',
  webhookSecret: 'foo',
});

// Create subscription checkout link
const url = safepay.checkout.createSubscription({
  planId: 'plan_33e626b3-d92e-40b3-a379-4f89d61f8c83',
  reference: 'client-profile-uuid',
  cancelUrl: 'https://arco.pk/subscribe/cancel',
  redirectUrl: 'https://arco.pk/subscribe/success',
});

// Cancel subscription
await safepay.subscription.cancel('sub_c94f2ffa-78cf-4de5-80c0-f57e3d1ce746');

// Pause subscription
await safepay.subscription.pause({
  behavior: SubscriptionPauseBehavior.MarkUncollectible,
  subscriptionId: 'sub_xxx',
});

// Resume subscription
await safepay.subscription.resume('sub_xxx');
```

### Subscription Pause Behaviors

| Behavior               | Description                                |
| ---------------------- | ------------------------------------------ |
| `KEEP_AS_READY`      | Maintains payment readiness (resume later) |
| `MARK_UNCOLLECTIBLE` | Blocks collection attempts                 |
| `MARK_VOID`          | Nullifies the payment transaction          |

---

## Payment Flow for AR-CO Consultations

### Complete Sequence Diagram

```
Overlay (Step 3)                    Backend API                     Safepay
      |                                 |                              |
      |  [Steps 1-2: Personal Info +    |                              |
      |   Case Details completed]       |                              |
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
      |                                 |                              |
      |                           [Webhook arrives later]              |
      |                                 |<-- payment.succeeded --------|
      |                                 |-- Verify HMAC                |
      |                                 |-- Idempotent update          |
```

### Key Design Decisions

1. **Overlay, not separate page:** The entire 4-step flow happens in a modal overlay
2. **Guest users:** No login required. Personal info collected in Step 1
3. **Backend-first session:** We create the payment session on the backend for amount control
4. **Popup window:** Safepay checkout opens in a popup, overlay stays open
5. **postMessage relay:** Callback page relays tracker to parent window, then closes
6. **Server-side verification:** Backend always verifies via reporter API before updating status
7. **Idempotent updates:** The webhook handler checks if already paid before updating
8. **Cal.com gated behind payment:** Step 4 only appears after payment confirmation

---

## Backend Endpoints (AR-CO Specific)

| Endpoint                                        | Auth        | Method | Purpose                                                      |
| ----------------------------------------------- | ----------- | ------ | ------------------------------------------------------------ |
| `POST /api/consultations`                     | @Public     | POST   | Create booking with intake data, create Safepay session      |
| `POST /api/consultations/:id/confirm-payment` | @Public     | POST   | Verify payment via tracker + signature, update status        |
| `GET /api/consultations/status`               | @Public     | GET    | Poll booking status by ref number + email                    |
| `POST /api/payments/webhook`                  | @Public     | POST   | Receive Safepay webhook, verify HMAC, route by metadata.type |
| `POST /api/consultations/webhook/calcom`      | @Public     | POST   | Receive Cal.com booking webhook                              |
| `GET /api/consultations`                      | Staff/Admin | GET    | List all bookings (admin view)                               |
| `GET /api/consultations/:id`                  | Staff/Admin | GET    | Booking detail (admin view)                                  |
| `PATCH /api/consultations/:id/cancel`         | Staff/Admin | PATCH  | Cancel booking                                               |

---

## Key Notes and Gotchas

### Critical Rules

1. **Amount format difference:** Backend SDK uses paisa (multiply by 100), frontend SafepayButton uses PKR directly. Getting this wrong means charging 100x too much or too little.
2. **Auth token expiry:** Passport/TBT token lasts 1 hour. Generate a fresh token per payment session. Expired tokens cause 401 errors.
3. **Always verify server-side:** NEVER trust the `onPayment` callback alone. Always verify via `safepay.payments.session.fetch(tracker)` or webhook before updating records.
4. **Guest flow:** Set `is_guest: true` when creating customers. No Safepay account is required for payers.
5. **Metadata for routing:** Include `type` and `referenceId` in metadata so webhooks can be routed to the correct service.
6. **Secret key exposure:** The `sec_xxx` secret key must NEVER reach the frontend. Only the `pub_xxx` merchant API key is safe for client-side use.
7. **Test card daily limit:** Same card number + email combination limited to 7-8 uses per day in sandbox.
8. **HMAC is SHA-512 on full body:** The webhook HMAC is computed using **SHA-512** on the **full JSON-encoded request body**, NOT SHA-256 on just the tracker token. Use `safepay.webhooks.constructEvent()` for reliable verification.
9. **Webhook idempotency:** Always check if the payment was already processed before updating. Webhooks can be delivered multiple times (retries).
10. **3DS is mandatory:** Safepay enforces 3D Secure authentication for card payments. The 3DS flow happens automatically within the checkout iframe.

### Common Mistakes

| Mistake                                           | Impact                          | Fix                                                                                      |
| ------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| Using `sec_xxx` in frontend `client` prop     | Security vulnerability          | Use `pub_xxx` merchant API key                                                         |
| Sending PKR amount to backend API                 | Charges 100x less than intended | Convert to paisa:`amount * 100`                                                        |
| Sending paisa amount to SafepayButton             | Charges 100x more than intended | Use PKR directly:`50000` not `5000000`                                               |
| Not verifying webhook signature                   | Vulnerable to forged webhooks   | Use `safepay.webhooks.constructEvent()` or manual HMAC-SHA512 with `timingSafeEqual` |
| Using SHA-256 instead of SHA-512 for webhook HMAC | Signature always mismatches     | Use SHA-512 algorithm:`crypto.createHmac('sha512', secret)`                            |
| Using tracker-only as HMAC message                | Signature always mismatches     | Use full JSON-encoded request body as the HMAC message                                   |
| Using `==` for signature comparison             | Timing attack vulnerability     | Use `crypto.timingSafeEqual()`                                                         |
| Not handling `onCancel`                         | User stuck with no feedback     | Show "Payment cancelled" toast                                                           |
| Caching expired TBT token                         | 401 errors on checkout          | Generate fresh token per session                                                         |
| Not storing tracker before payment                | Cannot reconcile payments       | Save tracker in DB immediately after creation                                            |

---

## External Resources

### Official Documentation

- [Safepay Documentation](https://safepay-docs.netlify.app/) - Main docs site
- [Integration Overview](https://safepay-docs.netlify.app/build-your-integration/overview/) - Express vs Advanced Checkout comparison
- [Express Checkout Guide](https://safepay-docs.netlify.app/build-your-integration/express-checkout/?platform=web) - Web integration
- [Express Checkout (Node.js)](https://safepay-docs.netlify.app/build-your-integration/express-checkout/?platform=node) - Backend SDK
- [Advanced Checkout Guide](https://safepay-docs.netlify.app/build-your-integration/advanced-checkout/introduction/) - Custom checkout forms
- [Payment Modes](https://safepay-docs.netlify.app/concepts/payment-modes/) - Mode/entry_mode reference
- [Webhook Types](https://safepay-docs.netlify.app/developers/webhooks/webhook-types/) - All 13 webhook event types
- [Verify HMAC Signatures](https://safepay-docs.netlify.app/developers/webhooks/verify-hmac-signatures/) - SHA-512 verification guide
- [Safepay API Reference](https://apidocs.getsafepay.com/) - Full API docs

### SDKs and Libraries

- [@sfpy/node-core (npm)](https://www.npmjs.com/package/@sfpy/node-core) - Backend SDK
- [@sfpy/checkout-components (npm)](https://www.npmjs.com/package/@sfpy/checkout-components) - Frontend components
- [@sfpy/node-sdk (npm)](https://www.npmjs.com/package/@sfpy/node-sdk) - Higher-level SDK (alternative)
- [safepay-checkout-components (GitHub)](https://github.com/getsafepay/safepay-checkout-components) - Source code
- [safepay-node (GitHub)](https://github.com/getsafepay/safepay-node) - Node SDK source
- [node-core (GitHub)](https://github.com/getsafepay/node-core) - Core SDK source

### Knowledge Base

- [Getting Started Guide](https://safepay.helpscoutdocs.com/article/50-starting-with-safepay-step-by-step-guide)
- [Dummy Card Information](https://safepay.helpscoutdocs.com/article/41-dummy-card-information) - Test cards
- [Testing Checkout Integration](https://safepay.helpscoutdocs.com/article/82-testing-the-latest-safepay-checkout-integration)
- [What is a Sandbox Account?](https://safepay.helpscoutdocs.com/article/56-is-my-sandbox-account-different-from-my-production-account)

### Blog Posts

- [Transaction Integrity (HMAC)](https://medium.com/safepay/transaction-integrity-b91a0f90010b) - Signature verification
- [Checkout Integration Guide](https://medium.com/safepay/safepay-checkout-integration-guide-78831226ccf8) - General integration

### Custom Integration Reference

- [Safepay Custom Integration (Gist)](https://gist.github.com/ziyadparekh/adc07113246b039b126c806cef9ad4a6) - Complete v1 API reference (legacy but informative)

### Dashboard

- [Sandbox Dashboard Login](https://sandbox.api.getsafepay.com/dashboard/login)
- [Production Dashboard Login](https://getsafepay.com/dashboard/login)
