# Lemon Squeezy JavaScript SDK Guide

**Package:** `@lemonsqueezy/lemonsqueezy.js`
**GitHub:** https://github.com/lmsqueezy/lemonsqueezy.js
**License:** MIT

---

## Installation

```bash
pnpm add @lemonsqueezy/lemonsqueezy.js --filter api
```

> **IMPORTANT:** This SDK is for server-side (backend) use only. Never expose your API key in the browser.

---

## Setup

```typescript
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// Call once at app startup (e.g., in NestJS module onModuleInit)
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY,
  onError: (error) => {
    console.error('Lemon Squeezy Error:', error);
  },
});
```

---

## Return Pattern

Every SDK function returns `{ data, error }`:

```typescript
const { data, error } = await createCheckout(storeId, variantId, options);

if (error) {
  // error.message: string
  // error.cause: unknown (underlying error)
  throw new Error(error.message);
}

// data follows JSON:API format
const checkoutUrl = data.data.attributes.url;
```

---

## All SDK Functions (59 total)

### Setup
| Function | Description |
|---|---|
| `lemonSqueezySetup({ apiKey, onError })` | Initialize SDK with API key |

### User / Stores
| Function | Description |
|---|---|
| `getAuthenticatedUser()` | Get current API key owner |
| `getStore(id)` | Retrieve a store |
| `listStores()` | List all stores |

### Customers
| Function | Description |
|---|---|
| `createCustomer(storeId, { name, email, city?, region?, country? })` | Create a customer |
| `getCustomer(id)` | Retrieve a customer |
| `updateCustomer(id, { name?, city?, ... })` | Update a customer |
| `listCustomers({ filter?, page? })` | List customers |
| `archiveCustomer(id)` | Archive a customer |

### Products & Variants
| Function | Description |
|---|---|
| `getProduct(id)` | Retrieve a product |
| `listProducts({ filter?, page? })` | List products |
| `getVariant(id)` | Retrieve a variant |
| `listVariants({ filter?, page? })` | List variants |

### Prices
| Function | Description |
|---|---|
| `getPrice(id)` | Retrieve a price |
| `listPrices({ filter?, page? })` | List prices |

### Checkouts (Key for AR-CO)
| Function | Description |
|---|---|
| `createCheckout(storeId, variantId, options?)` | Create a checkout session |
| `getCheckout(id)` | Retrieve a checkout |
| `listCheckouts({ filter?, page? })` | List checkouts |

**createCheckout options:**
```typescript
const { data, error } = await createCheckout(storeId, variantId, {
  customPrice: 5000000, // In cents (PKR 50,000.00)
  productOptions: {
    name: 'Consultation Fee',
    description: 'Legal consultation with AR&CO',
    redirectUrl: 'https://arco.com/payment/success',
    receiptButtonText: 'Return to AR&CO',
    receiptLinkUrl: 'https://arco.com',
    receiptThankYouNote: 'Thank you for your payment.',
    enabledVariants: [], // Empty = show all
  },
  checkoutOptions: {
    embed: false,       // true for overlay mode
    media: true,
    logo: true,
    desc: true,
    discount: false,
    skipTrial: false,
    buttonColor: '#1a1a2e',
  },
  checkoutData: {
    email: 'client@example.com',
    name: 'Client Name',
    billingAddress: {
      country: 'PK',
    },
    custom: {
      user_id: 'uuid-here',
      payment_type: 'consultation',        // 'consultation' | 'subscription' | 'service'
      reference_id: 'CON-2026-0001',
    },
  },
  expiresAt: '2026-03-01T00:00:00Z', // Optional
  preview: false,
  testMode: false,
});

const checkoutUrl = data.data.attributes.url;
```

### Orders
| Function | Description |
|---|---|
| `getOrder(id)` | Retrieve an order |
| `listOrders({ filter?, page? })` | List orders |
| `getOrderItem(id)` | Retrieve an order item |
| `listOrderItems({ filter?, page? })` | List order items |
| `generateOrderInvoice(id, { name, address, ... })` | Generate invoice PDF |
| `issueOrderRefund(id, amount)` | Issue a refund |

### Subscriptions (Key for AR-CO)
| Function | Description |
|---|---|
| `getSubscription(id)` | Retrieve a subscription |
| `listSubscriptions({ filter?, page? })` | List subscriptions |
| `updateSubscription(id, { variantId?, ... })` | Update subscription |
| `cancelSubscription(id)` | Cancel subscription |

**Subscription update options:**
```typescript
// Cancel subscription
const { data, error } = await cancelSubscription(subscriptionId);

// Pause subscription
await updateSubscription(subscriptionId, {
  pause: {
    mode: 'void', // 'void' or 'free'
    resumesAt: '2026-04-01T00:00:00Z',
  },
});

// Resume subscription
await updateSubscription(subscriptionId, {
  pause: null,
});

// Change plan
await updateSubscription(subscriptionId, {
  variantId: newVariantId,
  invoiceImmediately: true, // charge difference now
});
```

### Subscription Invoices
| Function | Description |
|---|---|
| `getSubscriptionInvoice(id)` | Retrieve an invoice |
| `listSubscriptionInvoices({ filter?, page? })` | List invoices |
| `generateSubscriptionInvoice(id, { name, address, ... })` | Generate invoice PDF |
| `issueSubscriptionInvoiceRefund(id, amount)` | Refund an invoice |

### Subscription Items & Usage
| Function | Description |
|---|---|
| `getSubscriptionItem(id)` | Retrieve a subscription item |
| `listSubscriptionItems({ filter?, page? })` | List subscription items |
| `updateSubscriptionItem(id, { quantity })` | Update item quantity |
| `getSubscriptionItemCurrentUsage(id)` | Get current usage |
| `createUsageRecord(subscriptionItemId, { quantity, action })` | Create usage record |
| `getUsageRecord(id)` | Retrieve a usage record |
| `listUsageRecords({ filter?, page? })` | List usage records |

### Discounts
| Function | Description |
|---|---|
| `createDiscount(storeId, { name, code, amount, ... })` | Create a discount |
| `getDiscount(id)` | Retrieve a discount |
| `listDiscounts({ filter?, page? })` | List discounts |
| `deleteDiscount(id)` | Delete a discount |
| `getDiscountRedemption(id)` | Get a redemption |
| `listDiscountRedemptions({ filter?, page? })` | List redemptions |

### Webhooks
| Function | Description |
|---|---|
| `createWebhook(storeId, { url, events, secret })` | Create a webhook |
| `getWebhook(id)` | Retrieve a webhook |
| `listWebhooks({ filter?, page? })` | List webhooks |
| `updateWebhook(id, { url?, events?, secret? })` | Update a webhook |
| `deleteWebhook(id)` | Delete a webhook |

### License Keys
| Function | Description |
|---|---|
| `getLicenseKey(id)` | Retrieve a license key |
| `listLicenseKeys({ filter?, page? })` | List license keys |
| `updateLicenseKey(id, options)` | Update a license key |
| `validateLicense(key, instanceId?)` | Validate a license |
| `activateLicense(key, instanceName)` | Activate a license |
| `deactivateLicense(key, instanceId)` | Deactivate a license |
| `getLicenseKeyInstance(id)` | Retrieve a license instance |
| `listLicenseKeyInstances({ filter?, page? })` | List instances |

### Files
| Function | Description |
|---|---|
| `getFile(id)` | Retrieve a file |
| `listFiles({ filter?, page? })` | List files |

---

## TypeScript Types

The SDK is fully typed. Key types for AR-CO:

```typescript
import type {
  Checkout,
  NewCheckout,
  Subscription,
  Order,
  Customer,
  Variant,
  Product,
  Webhook,
} from '@lemonsqueezy/lemonsqueezy.js';
```

---

## Environment Variables

```env
# .env (apps/api)
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_signing_secret

# Product variant IDs (set up in Lemon Squeezy dashboard)
LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID=variant_id_for_civic_retainer
LEMONSQUEEZY_CONSULTATION_VARIANT_ID=variant_id_for_consultation
LEMONSQUEEZY_SERVICE_VARIANT_ID=variant_id_for_generic_service
```

---

## Error Handling Pattern

```typescript
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

async function createPaymentSession() {
  const { data, error } = await createCheckout(storeId, variantId, options);

  if (error) {
    // error.message contains the error description
    // error.cause contains the underlying error if any
    throw new HttpException(
      `Payment session creation failed: ${error.message}`,
      HttpStatus.BAD_GATEWAY,
    );
  }

  return {
    checkoutUrl: data.data.attributes.url,
    checkoutId: data.data.id,
  };
}
```
