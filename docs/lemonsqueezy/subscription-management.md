# Lemon Squeezy Subscription Management

This document covers the full subscription lifecycle for AR-CO's Civic Retainer plan (PKR 700/month).

---

## Subscription States

```
                    ┌──────────┐
                    │ on_trial │ (if trial configured)
                    └────┬─────┘
                         │ trial ends
                         v
┌─────────────────────────────────────────────┐
│                  active                      │
│  (billing normally, access granted)          │
├──────────┬──────────┬──────────┬────────────┤
│ payment  │ customer │ admin    │ admin      │
│ fails    │ cancels  │ pauses   │ (no action)│
v          v          v          │            │
┌────────┐ ┌─────────┐ ┌──────┐ │            │
│past_due│ │cancelled│ │paused│ │            │
│(retry) │ │(grace)  │ │      │ │            │
└───┬────┘ └────┬────┘ └──┬───┘ │            │
    │           │         │     │            │
    │ 4 fails   │ renewal │ un- │            │
    v           │ date    │pause│            │
┌──────┐       │ passes  │     │            │
│unpaid│       v         v     │            │
└──┬───┘  ┌───────┐  ┌──────┐ │            │
   │      │expired│  │active│ │            │
   │      └───────┘  └──────┘ │            │
   │ dunning                   │            │
   │ exhausted                 │            │
   v                           │            │
┌───────┐                     │            │
│expired│                     │            │
└───────┘                     │            │
```

### State Descriptions

| Status | Description | Access Granted? |
|---|---|---|
| `on_trial` | Free trial period active | Yes |
| `active` | Billing normally | Yes |
| `paused` | Payment collection suspended | Depends on mode |
| `past_due` | Renewal payment failed, retrying (up to 4 attempts over 2 weeks) | Yes |
| `unpaid` | All retry attempts exhausted | Depends on dunning |
| `cancelled` | Customer cancelled, in grace period until next renewal | Yes (until `ends_at`) |
| `expired` | Subscription ended, no longer valid | No |

### AR-CO Access Rules

For the Civic Retainer (complaint submission):
- **Grant access:** `on_trial`, `active`, `past_due`, `cancelled` (before `ends_at`)
- **Deny access:** `unpaid`, `expired`, `paused`

```typescript
function isSubscriptionActive(status: string, endsAt: string | null): boolean {
  if (['active', 'on_trial', 'past_due'].includes(status)) return true;
  if (status === 'cancelled' && endsAt && new Date(endsAt) > new Date()) return true;
  return false;
}
```

---

## Creating a Subscription

Subscriptions are created when a customer completes a checkout for a subscription product variant. There is no direct "create subscription" API — use checkout:

```typescript
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

const { data, error } = await createCheckout(
  STORE_ID,
  SUBSCRIPTION_VARIANT_ID,
  {
    checkoutData: {
      email: user.email,
      name: user.fullName,
      custom: {
        payment_type: 'subscription',
        user_id: user.id,
      },
    },
    productOptions: {
      redirectUrl: `${FRONTEND_URL}/payment/success?type=subscription`,
    },
  }
);
```

After checkout completes, Lemon Squeezy fires `subscription_created` webhook.

---

## Retrieving Subscription Status

```typescript
import { getSubscription, listSubscriptions } from '@lemonsqueezy/lemonsqueezy.js';

// Get specific subscription by Lemon Squeezy subscription ID
const { data, error } = await getSubscription(subscriptionId);
const status = data.data.attributes.status;
const renewsAt = data.data.attributes.renews_at;

// List all subscriptions for a store, filtered by customer
const { data: subs } = await listSubscriptions({
  filter: {
    storeId: STORE_ID,
    userEmail: user.email,
  },
});
```

### Key Subscription Fields

```typescript
interface SubscriptionAttributes {
  store_id: number;
  customer_id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  product_name: string;           // "Civic Retainer"
  variant_name: string;           // "Monthly"
  user_name: string;
  user_email: string;
  status: 'on_trial' | 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired';
  card_brand: string;             // "visa", "mastercard", etc.
  card_last_four: string;         // "4242"
  billing_anchor: number;         // Day of month (1-31)
  renews_at: string;              // ISO 8601 - next renewal date
  ends_at: string | null;         // ISO 8601 - when cancelled sub expires
  trial_ends_at: string | null;   // ISO 8601 - trial end
  pause: object | null;           // Pause details if paused
  cancelled: boolean;
  urls: {
    update_payment_method: string; // Pre-signed URL (24h validity)
    customer_portal: string;       // Customer portal URL (24h validity)
    update_customer_portal: string;
  };
  first_subscription_item: {
    id: number;
    subscription_id: number;
    price_id: number;
    quantity: number;
  };
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}
```

---

## Cancelling a Subscription

```typescript
import { cancelSubscription } from '@lemonsqueezy/lemonsqueezy.js';

// Cancel subscription (enters grace period until next renewal)
const { data, error } = await cancelSubscription(subscriptionId);

// Response: status = "cancelled", ends_at = next renewal date
```

After cancellation:
- Status becomes `cancelled`
- `ends_at` is set to the next billing date
- Customer retains access until `ends_at`
- If `ends_at` passes without resuming, status becomes `expired`

---

## Resuming a Cancelled Subscription

```typescript
import { updateSubscription } from '@lemonsqueezy/lemonsqueezy.js';

// Resume before ends_at
const { data, error } = await updateSubscription(subscriptionId, {
  cancelled: false,
});

// Status returns to "active", ends_at cleared
```

---

## Pausing a Subscription

```typescript
import { updateSubscription } from '@lemonsqueezy/lemonsqueezy.js';

// Pause - void mode (customer not charged)
const { data, error } = await updateSubscription(subscriptionId, {
  pause: {
    mode: 'void',                              // 'void' or 'free'
    resumesAt: '2026-04-01T00:00:00Z',         // Optional auto-resume date
  },
});

// Unpause
await updateSubscription(subscriptionId, {
  pause: null,
});
```

**Pause Modes:**
- `void` - Invoices are voided, customer is not charged
- `free` - Customer gets access for free (no invoices generated)

---

## Handling Failed Payments

When a recurring payment fails:

1. `subscription_payment_failed` webhook fires
2. Status changes to `past_due`
3. Lemon Squeezy retries up to **4 times over 2 weeks**
4. If payment recovers: `subscription_payment_recovered` webhook fires, status returns to `active`
5. If all retries fail: status changes to `unpaid`
6. Dunning rules (configured in dashboard) determine what happens next

### Dunning Configuration
Set up in Lemon Squeezy Dashboard > Settings > Email:
- Configure retry intervals
- Set up payment failure notification emails
- Choose whether to cancel or pause after exhausting retries

---

## Updating Payment Method

Lemon Squeezy provides a pre-signed URL for customers to update their payment method:

```typescript
const { data } = await getSubscription(subscriptionId);
const updateUrl = data.data.attributes.urls.update_payment_method;

// URL is valid for 24 hours - fetch fresh each time
// Open in overlay or redirect
window.LemonSqueezy.Url.Open(updateUrl);
```

---

## Changing Billing Anchor

```typescript
// Change billing day to 1st of each month
await updateSubscription(subscriptionId, {
  billingAnchor: 1, // 1-31, null or 0 to reset to today
});
```

---

## Webhook Events to Handle

### subscription_created
Store the subscription in your database:
```typescript
async handleSubscriptionCreated(payload: WebhookPayload) {
  const sub = payload.data.attributes;
  const customData = payload.meta.custom_data;

  await this.db.from('user_subscriptions').insert({
    user_profile_id: customData.user_id,
    lemonsqueezy_subscription_id: payload.data.id,
    lemonsqueezy_customer_id: String(sub.customer_id),
    plan_name: 'civic_retainer',
    status: sub.status,
    current_period_start: sub.created_at,
    current_period_end: sub.renews_at,
    card_brand: sub.card_brand,
    card_last_four: sub.card_last_four,
  });
}
```

### subscription_updated
Update status and billing info:
```typescript
async handleSubscriptionUpdated(payload: WebhookPayload) {
  const sub = payload.data.attributes;

  await this.db.from('user_subscriptions')
    .update({
      status: sub.status,
      current_period_end: sub.renews_at,
      card_brand: sub.card_brand,
      card_last_four: sub.card_last_four,
      cancelled_at: sub.cancelled ? new Date().toISOString() : null,
      ends_at: sub.ends_at,
    })
    .eq('lemonsqueezy_subscription_id', payload.data.id);
}
```

### subscription_payment_success
Log the payment event:
```typescript
async handlePaymentSuccess(payload: WebhookPayload) {
  // Extend the subscription period
  await this.db.from('user_subscriptions')
    .update({
      status: 'active',
      current_period_end: payload.data.attributes.renews_at,
    })
    .eq('lemonsqueezy_subscription_id', payload.data.id);

  // Log the payment event
  await this.db.from('subscription_events').insert({
    subscription_id: subscriptionDbId,
    event_type: 'payment_success',
    data: payload,
  });
}
```

### subscription_cancelled / subscription_expired
```typescript
async handleSubscriptionCancelled(payload: WebhookPayload) {
  await this.db.from('user_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      ends_at: payload.data.attributes.ends_at,
    })
    .eq('lemonsqueezy_subscription_id', payload.data.id);
}

async handleSubscriptionExpired(payload: WebhookPayload) {
  await this.db.from('user_subscriptions')
    .update({ status: 'expired' })
    .eq('lemonsqueezy_subscription_id', payload.data.id);
}
```

---

## Customer Portal

Lemon Squeezy provides a customer portal URL where customers can manage their subscription independently:

```typescript
const { data } = await getSubscription(subscriptionId);
const portalUrl = data.data.attributes.urls.customer_portal;

// Portal URL valid for 24 hours
// Customer can: update payment method, view invoices, cancel subscription
```
