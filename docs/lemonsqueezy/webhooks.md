# Lemon Squeezy Webhooks

Webhooks allow Lemon Squeezy to notify AR-CO's backend in real-time when events occur (payments, subscription changes, etc.).

---

## Webhook Event Types

### Order Events
| Event | Trigger |
|---|---|
| `order_created` | A new order is placed (one-time payment completed) |
| `order_refunded` | An order is refunded |

### Subscription Events
| Event | Trigger |
|---|---|
| `subscription_created` | A new subscription is created |
| `subscription_updated` | Subscription details change (plan, status, billing) |
| `subscription_cancelled` | Customer cancels subscription |
| `subscription_resumed` | Cancelled subscription is resumed before expiry |
| `subscription_expired` | Cancelled subscription passes renewal date |
| `subscription_paused` | Subscription is paused |
| `subscription_unpaused` | Paused subscription is resumed |

### Subscription Payment Events
| Event | Trigger |
|---|---|
| `subscription_payment_success` | Recurring payment succeeds |
| `subscription_payment_failed` | Recurring payment fails (retry begins) |
| `subscription_payment_recovered` | Previously failed payment is recovered |

### Customer Events
| Event | Trigger |
|---|---|
| `customer_updated` | Customer details are updated |

### License Events
| Event | Trigger |
|---|---|
| `license_key_created` | A license key is created |
| `license_key_updated` | A license key is updated |

---

## Events Relevant to AR-CO

| AR-CO Flow | Events to Subscribe |
|---|---|
| **Consultation Payment** | `order_created`, `order_refunded` |
| **Service Registration Payment** | `order_created`, `order_refunded` |
| **Civic Retainer Subscription** | `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_payment_success`, `subscription_payment_failed`, `subscription_payment_recovered` |

---

## Webhook Payload Structure

All webhook payloads follow this format:

```json
{
  "meta": {
    "event_name": "order_created",
    "webhook_id": "wh_abc123",
    "custom_data": {
      "user_id": "uuid-here",
      "payment_type": "consultation",
      "reference_id": "CON-2026-0001"
    }
  },
  "data": {
    "type": "orders",
    "id": "1",
    "attributes": {
      "store_id": 1,
      "customer_id": 1,
      "identifier": "uuid-identifier",
      "order_number": 1001,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "currency": "PKR",
      "subtotal": 5000000,
      "tax": 0,
      "total": 5000000,
      "total_formatted": "PKR 50,000.00",
      "status": "paid",
      "first_order_item": {
        "product_name": "Consultation Fee",
        "variant_name": "Default",
        "price": 5000000
      },
      "created_at": "2026-01-15T10:30:00.000000Z",
      "test_mode": false
    },
    "relationships": {
      "store": { "links": { "related": "..." } },
      "customer": { "links": { "related": "..." } },
      "order-items": { "links": { "related": "..." } }
    }
  }
}
```

### Subscription Event Payload

```json
{
  "meta": {
    "event_name": "subscription_created",
    "webhook_id": "wh_abc123",
    "custom_data": {
      "user_id": "uuid-here",
      "payment_type": "subscription"
    }
  },
  "data": {
    "type": "subscriptions",
    "id": "1",
    "attributes": {
      "store_id": 1,
      "customer_id": 1,
      "order_id": 1,
      "product_id": 1,
      "variant_id": 1,
      "product_name": "Civic Retainer",
      "variant_name": "Monthly",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "status": "active",
      "card_brand": "visa",
      "card_last_four": "4242",
      "renews_at": "2026-02-15T10:30:00.000000Z",
      "ends_at": null,
      "trial_ends_at": null,
      "billing_anchor": 15,
      "urls": {
        "update_payment_method": "https://...",
        "customer_portal": "https://..."
      },
      "first_subscription_item": {
        "id": 1,
        "subscription_id": 1,
        "price_id": 1,
        "quantity": 1
      },
      "created_at": "2026-01-15T10:30:00.000000Z",
      "test_mode": false
    }
  }
}
```

---

## Custom Data in Webhooks

Custom data passed during checkout creation appears in `meta.custom_data`:

```json
{
  "meta": {
    "event_name": "order_created",
    "custom_data": {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "payment_type": "consultation",
      "reference_id": "CON-2026-0001"
    }
  }
}
```

AR-CO uses `custom_data` to route webhook events:
- `payment_type: "consultation"` -> ConsultationsService
- `payment_type: "subscription"` -> SubscriptionsService
- `payment_type: "service"` -> ServiceRegistrationsService

---

## Signature Verification

Every webhook request includes an `X-Signature` header containing an HMAC-SHA256 hash.

### Verification Process

1. Extract the raw request body (as a string, before JSON parsing)
2. Compute HMAC-SHA256 using your webhook signing secret
3. Compare the computed hash with the `X-Signature` header
4. Reject requests where signatures don't match

### NestJS Implementation

```typescript
import { createHmac } from 'crypto';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';

function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string,
  secret: string,
): boolean {
  const hmac = createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  return digest === signature;
}

// In controller:
@Post('webhooks/lemonsqueezy')
@Public()
async handleWebhook(@Req() req: RawBodyRequest<Request>) {
  const signature = req.headers['x-signature'] as string;
  const rawBody = req.rawBody;

  if (!signature || !rawBody) {
    throw new UnauthorizedException('Missing signature or body');
  }

  const isValid = verifyWebhookSignature(
    rawBody,
    signature,
    this.configService.get('LEMONSQUEEZY_WEBHOOK_SECRET'),
  );

  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  const payload = JSON.parse(rawBody.toString());
  // Route based on event_name and custom_data...
}
```

### Important: Raw Body Access

NestJS must be configured to preserve the raw request body for signature verification:

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  rawBody: true,  // Enable raw body access
});
```

---

## Retry Policy

- Lemon Squeezy retries failed webhooks (non-200 responses) up to **3 additional times** (4 total attempts)
- After 4 failed attempts, retries stop
- Manual resend is available from the Lemon Squeezy dashboard
- Failed webhooks can be inspected in dashboard > Settings > Webhooks

### Best Practices

1. **Return 200 immediately** - Process events asynchronously
2. **Store events before processing** - Save the raw webhook payload, then process
3. **Implement idempotency** - Handle duplicate webhook deliveries gracefully
4. **Use event_name for routing** - Don't rely solely on custom_data

---

## Setting Up Webhooks

### Via Dashboard
1. Go to Lemon Squeezy Dashboard > Settings > Webhooks
2. Add your endpoint URL (e.g., `https://api.arco.pk/api/webhooks/lemonsqueezy`)
3. Create a signing secret and save it as `LEMONSQUEEZY_WEBHOOK_SECRET`
4. Select events to subscribe to

### Via API / SDK
```typescript
import { createWebhook } from '@lemonsqueezy/lemonsqueezy.js';

await createWebhook(storeId, {
  url: 'https://api.arco.pk/api/webhooks/lemonsqueezy',
  events: [
    'order_created',
    'order_refunded',
    'subscription_created',
    'subscription_updated',
    'subscription_cancelled',
    'subscription_expired',
    'subscription_payment_success',
    'subscription_payment_failed',
    'subscription_payment_recovered',
  ],
  secret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
});
```

---

## Testing Webhooks

1. Use **test mode** API keys during development
2. Create test products with daily billing for faster subscription testing
3. Manually trigger webhook events from the dashboard
4. For subscription payment events, the subscription must complete at least one renewal cycle first
5. Use tools like ngrok to expose local dev server for webhook testing:
   ```bash
   ngrok http 4000
   # Then set webhook URL to: https://your-ngrok-id.ngrok.io/api/webhooks/lemonsqueezy
   ```
