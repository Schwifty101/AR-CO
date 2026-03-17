# Lemon Squeezy Checkout Integration

Checkouts are how AR-CO collects payments. A checkout creates a unique, secure payment page for a specific product variant.

---

## Checkout Flow

```
1. User clicks "Pay" on AR-CO frontend
2. Frontend calls AR-CO backend (POST /api/payments/checkout)
3. Backend calls Lemon Squeezy SDK: createCheckout(storeId, variantId, options)
4. Lemon Squeezy returns a signed checkout URL
5. Backend returns URL to frontend
6. Frontend redirects user to checkout URL (or opens overlay)
7. User completes payment on Lemon Squeezy hosted page
8. Lemon Squeezy redirects user to success/cancel URL
9. Lemon Squeezy sends webhook to backend
10. Backend processes webhook and updates database
```

---

## Creating a Checkout

### SDK Method

```typescript
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

const { data, error } = await createCheckout(
  storeId,   // number - Your Lemon Squeezy store ID
  variantId, // number - The product variant ID
  {
    // All options are optional
    customPrice: 5000000,         // Price in cents (PKR 50,000.00)
    productOptions: { ... },
    checkoutOptions: { ... },
    checkoutData: { ... },
    expiresAt: '2026-03-01T00:00:00Z',
    preview: false,
    testMode: false,
  }
);
```

### API Method (raw HTTP)

```http
POST https://api.lemonsqueezy.com/v1/checkouts
Authorization: Bearer {API_KEY}
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "checkouts",
    "attributes": {
      "custom_price": 5000000,
      "product_options": { ... },
      "checkout_options": { ... },
      "checkout_data": { ... },
      "expires_at": "2026-03-01T00:00:00Z"
    },
    "relationships": {
      "store": {
        "data": { "type": "stores", "id": "1" }
      },
      "variant": {
        "data": { "type": "variants", "id": "123" }
      }
    }
  }
}
```

---

## Checkout Options Reference

### product_options

Override product display in checkout:

| Field | Type | Description |
|---|---|---|
| `name` | string | Override product name |
| `description` | string | Override product description |
| `media` | string[] | Array of image/video URLs |
| `redirectUrl` | string | URL to redirect after purchase |
| `receiptButtonText` | string | Button text on receipt page |
| `receiptLinkUrl` | string | URL the receipt button links to |
| `receiptThankYouNote` | string | Thank you message on receipt |
| `enabledVariants` | number[] | Limit visible variants (empty = all) |

### checkout_options

Control checkout UI appearance:

| Field | Type | Default | Description |
|---|---|---|---|
| `embed` | boolean | false | Enable overlay/embed mode |
| `media` | boolean | true | Show product media |
| `logo` | boolean | true | Show store logo |
| `desc` | boolean | true | Show product description |
| `discount` | boolean | true | Show discount code field |
| `skipTrial` | boolean | false | Skip free trial |
| `subscriptionPreview` | boolean | true | Show subscription preview |
| `buttonColor` | string | "#7047EB" | Hex color for buttons |
| `locale` | string | "en" | ISO 639 language code |

### checkout_data

Prefill customer data and pass custom metadata:

| Field | Type | Description |
|---|---|---|
| `email` | string | Prefill customer email |
| `name` | string | Prefill customer name |
| `billingAddress.country` | string | ISO country code (e.g., "PK") |
| `billingAddress.zip` | string | Postal code |
| `taxNumber` | string | Tax identification number |
| `discountCode` | string | Pre-apply discount code |
| `custom` | object | Custom key-value data (appears in webhooks) |
| `variantQuantities` | array | `[{ variant_id, quantity }]` |

---

## One-Time Payment Checkout (Consultation / Service Fee)

```typescript
// Consultation fee: PKR 50,000
const { data, error } = await createCheckout(
  STORE_ID,
  CONSULTATION_VARIANT_ID,
  {
    customPrice: 5000000, // 50000 * 100 cents
    productOptions: {
      name: 'Legal Consultation Fee',
      description: 'One-time consultation with AR&CO Law Firm',
      redirectUrl: `${FRONTEND_URL}/payment/success?type=consultation&ref=${referenceNumber}`,
    },
    checkoutData: {
      email: booking.email,
      name: booking.fullName,
      billingAddress: { country: 'PK' },
      custom: {
        payment_type: 'consultation',
        reference_id: booking.referenceNumber,
        user_id: booking.userId || '',
      },
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
  }
);
```

```typescript
// Service registration fee: variable amount
const { data, error } = await createCheckout(
  STORE_ID,
  SERVICE_VARIANT_ID,
  {
    customPrice: service.registrationFee * 100, // Convert to cents
    productOptions: {
      name: `${service.name} Registration Fee`,
      description: `Registration fee for ${service.name} service`,
      redirectUrl: `${FRONTEND_URL}/payment/success?type=service&ref=${registration.referenceNumber}`,
    },
    checkoutData: {
      email: registration.email,
      name: registration.fullName,
      billingAddress: { country: 'PK' },
      custom: {
        payment_type: 'service',
        reference_id: registration.referenceNumber,
        service_id: service.id,
      },
    },
  }
);
```

---

## Subscription Checkout (Civic Retainer)

For subscriptions, the variant must be a subscription product (set up in the Lemon Squeezy dashboard). The `customPrice` applies to all renewal payments.

```typescript
const { data, error } = await createCheckout(
  STORE_ID,
  SUBSCRIPTION_VARIANT_ID, // Must be a subscription variant
  {
    // customPrice is optional; omit to use the variant's default price (PKR 700)
    productOptions: {
      name: 'Civic Retainer Subscription',
      description: 'Monthly subscription for civic complaint advocacy (PKR 700/month)',
      redirectUrl: `${FRONTEND_URL}/payment/success?type=subscription`,
    },
    checkoutOptions: {
      discount: false, // No discount codes for subscriptions
    },
    checkoutData: {
      email: user.email,
      name: user.fullName,
      billingAddress: { country: 'PK' },
      custom: {
        payment_type: 'subscription',
        user_id: user.id,
        client_profile_id: user.clientProfileId,
      },
    },
  }
);
```

---

## Checkout Display Modes

### Hosted Checkout (Redirect)
Default mode. User is redirected to `checkout.lemonsqueezy.com`.

```typescript
// Backend returns URL, frontend redirects
window.location.href = checkoutUrl;
```

### Overlay Checkout (Embed)
Checkout opens as an overlay on your page. Requires Lemon.js.

**Frontend setup:**
```html
<!-- Add to layout or page -->
<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
```

```typescript
// Set embed: true when creating checkout
checkoutOptions: { embed: true }

// Frontend: open overlay
window.LemonSqueezy.Url.Open(checkoutUrl);

// Or use a link with class
<a href={checkoutUrl} className="lemonsqueezy-button">Pay Now</a>
```

**Lemon.js Events (for overlay mode):**
```typescript
window.LemonSqueezy.Setup({
  eventHandler: (event) => {
    if (event === 'Checkout.Success') {
      // Payment completed in overlay
      // Redirect or show success message
    }
    if (event === 'Checkout.Closed') {
      // User closed the overlay
    }
  },
});
```

---

## Checkout URL Format

Generated checkout URLs look like:
```
https://your-store.lemonsqueezy.com/checkout/custom/abc123-def456-...
```

These are signed, single-use URLs. Do NOT:
- Cache them indefinitely (they expire)
- Share them between users
- Construct them manually

---

## Post-Payment Flow

After payment:

1. **Redirect:** User lands on `redirectUrl` with query params added by Lemon Squeezy
2. **Webhook:** Lemon Squeezy POSTs to your webhook endpoint with event data
3. **Backend Processing:** Parse webhook, verify signature, update DB

**Do NOT rely on the redirect URL alone to confirm payment.** Always use webhooks for payment confirmation. The redirect is for UX only.

---

## Price Format

All prices in Lemon Squeezy API are in **cents** (smallest currency unit):

| Amount | API Value |
|---|---|
| PKR 700.00 | `70000` |
| PKR 50,000.00 | `5000000` |
| PKR 5,000.00 | `500000` |
| USD 9.99 | `999` |
