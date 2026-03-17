# AR-CO Lemon Squeezy Integration Plan

This document maps AR-CO's payment flows to Lemon Squeezy concepts and defines the implementation strategy.

---

## Lemon Squeezy Dashboard Setup (Prerequisites)

Before writing any code, create these in the Lemon Squeezy dashboard:

### Products to Create

| # | Product Name | Type | Price | Variant Name | Notes |
|---|---|---|---|---|---|
| 1 | **Civic Retainer** | Subscription (Monthly) | PKR 700/month | "Monthly" | For complaint submission access |
| 2 | **Legal Consultation** | One-time | PKR 50,000 | "Standard" | Guest consultation booking |
| 3 | **Facilitation Service** | One-time | PKR 0 (use custom_price) | "Default" | Variable per-service fee via `custom_price` |

### Webhook Configuration

Create a webhook in Dashboard > Settings > Webhooks:
- **URL:** `https://api.arco.pk/api/webhooks/lemonsqueezy`
- **Signing Secret:** Generate and save as `LEMONSQUEEZY_WEBHOOK_SECRET`
- **Events:**
  - `order_created`
  - `order_refunded`
  - `subscription_created`
  - `subscription_updated`
  - `subscription_cancelled`
  - `subscription_expired`
  - `subscription_payment_success`
  - `subscription_payment_failed`
  - `subscription_payment_recovered`

### Store & Variant IDs

After creating products, note these IDs for env vars:
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID`
- `LEMONSQUEEZY_CONSULTATION_VARIANT_ID`
- `LEMONSQUEEZY_SERVICE_VARIANT_ID`

---

## Environment Variables

```env
# apps/api/.env
LEMONSQUEEZY_API_KEY=your_live_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_signing_secret
LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID=variant_for_civic_retainer
LEMONSQUEEZY_CONSULTATION_VARIANT_ID=variant_for_consultation
LEMONSQUEEZY_SERVICE_VARIANT_ID=variant_for_service_fees

# Frontend URL for redirects
FRONTEND_URL=https://arco.pk
```

---

## Payment Flow 1: Civic Retainer Subscription (PKR 700/month)

### User Journey
1. User visits `/subscribe` page
2. User clicks "Subscribe Now"
3. If not logged in -> redirect to `/auth/signin` then back to `/subscribe`
4. Backend creates checkout for subscription variant
5. User is redirected to Lemon Squeezy checkout
6. User pays PKR 700
7. Lemon Squeezy redirects to `/payment/success?type=subscription`
8. Webhook `subscription_created` fires -> backend creates `user_subscriptions` record
9. User can now submit complaints

### Backend Implementation

```typescript
// SubscriptionsService.createSubscription(userId)
async createSubscription(user: AuthUser): Promise<{ checkoutUrl: string }> {
  // 1. Check no active subscription exists
  const existing = await this.getActiveSubscription(user.id);
  if (existing) throw new ConflictException('Active subscription already exists');

  // 2. Create Lemon Squeezy checkout
  const { data, error } = await createCheckout(
    this.configService.get('LEMONSQUEEZY_STORE_ID'),
    this.configService.get('LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID'),
    {
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
      productOptions: {
        redirectUrl: `${this.configService.get('FRONTEND_URL')}/payment/success?type=subscription`,
      },
    },
  );

  if (error) throw new BadGatewayException('Failed to create checkout');

  // 3. Create pending subscription record
  await this.supabaseService.getAdminClient()
    .from('user_subscriptions')
    .insert({
      user_profile_id: user.id,
      status: 'pending',
      plan_name: 'civic_retainer',
      monthly_amount: 700,
      currency: 'PKR',
    });

  return { checkoutUrl: data.data.attributes.url };
}
```

### Webhook Handler (subscription_created)

```typescript
async handleSubscriptionCreated(payload: LemonSqueezyWebhookPayload) {
  const sub = payload.data.attributes;
  const { user_id, client_profile_id } = payload.meta.custom_data;

  await this.supabaseService.getAdminClient()
    .from('user_subscriptions')
    .update({
      status: sub.status, // 'active'
      lemonsqueezy_subscription_id: payload.data.id,
      lemonsqueezy_customer_id: String(sub.customer_id),
      current_period_start: sub.created_at,
      current_period_end: sub.renews_at,
      card_brand: sub.card_brand,
      card_last_four: sub.card_last_four,
    })
    .eq('user_profile_id', user_id);
}
```

---

## Payment Flow 2: Consultation Fee (PKR 50,000 one-time)

### User Journey
1. Guest visits `/consultation` page
2. Fills intake form (name, email, phone, practice area, issue summary)
3. Backend creates consultation_bookings record
4. Backend creates Lemon Squeezy checkout (one-time, PKR 50,000)
5. Guest is redirected to checkout
6. Guest pays
7. Redirect to `/payment/success?type=consultation&ref=CON-2026-0001`
8. Webhook `order_created` fires -> backend updates booking to `payment_confirmed`
9. Cal.com embed becomes visible for booking

### Backend Implementation

```typescript
// ConsultationsService.initiatePayment(bookingId)
async initiatePayment(bookingId: string): Promise<{ checkoutUrl: string }> {
  const booking = await this.getBookingById(bookingId);
  if (!booking) throw new NotFoundException('Booking not found');
  if (booking.payment_status === 'paid') throw new ConflictException('Already paid');

  const { data, error } = await createCheckout(
    this.configService.get('LEMONSQUEEZY_STORE_ID'),
    this.configService.get('LEMONSQUEEZY_CONSULTATION_VARIANT_ID'),
    {
      customPrice: 5000000, // PKR 50,000 in cents
      checkoutData: {
        email: booking.email,
        name: booking.full_name,
        billingAddress: { country: 'PK' },
        custom: {
          payment_type: 'consultation',
          reference_id: booking.reference_number,
          booking_id: booking.id,
        },
      },
      productOptions: {
        name: 'Legal Consultation Fee',
        redirectUrl: `${this.configService.get('FRONTEND_URL')}/payment/success?type=consultation&ref=${booking.reference_number}`,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  );

  if (error) throw new BadGatewayException('Failed to create checkout');

  // Update booking with checkout info
  await this.supabaseService.getAdminClient()
    .from('consultation_bookings')
    .update({ lemonsqueezy_checkout_id: data.data.id })
    .eq('id', bookingId);

  return { checkoutUrl: data.data.attributes.url };
}
```

### Webhook Handler (order_created for consultation)

```typescript
async handleOrderCreated(payload: LemonSqueezyWebhookPayload) {
  const customData = payload.meta.custom_data;
  const paymentType = customData?.payment_type;

  switch (paymentType) {
    case 'consultation':
      await this.consultationsService.handlePaymentConfirmed(
        customData.booking_id,
        {
          orderId: payload.data.id,
          orderNumber: payload.data.attributes.order_number,
          amount: payload.data.attributes.total,
          currency: payload.data.attributes.currency,
        },
      );
      break;

    case 'service':
      await this.serviceRegistrationsService.handlePaymentConfirmed(
        customData.reference_id,
        { ... },
      );
      break;

    default:
      this.logger.warn(`Unknown payment_type in order webhook: ${paymentType}`);
  }
}
```

---

## Payment Flow 3: Service Registration Fee (Variable one-time)

### User Journey
1. Guest visits `/services/[category]/[slug]/form`
2. Fills registration form (name, email, phone, CNIC, description)
3. Backend creates service_registrations record
4. Backend creates Lemon Squeezy checkout with `custom_price` from `services.registration_fee`
5. Guest pays
6. Webhook `order_created` fires -> backend confirms payment, auto-creates user account
7. Credentials email sent to guest

### Backend Implementation

```typescript
// ServiceRegistrationsService.initiatePayment(registrationId)
async initiatePayment(registrationId: string): Promise<{ checkoutUrl: string }> {
  const registration = await this.getRegistrationById(registrationId);
  const service = await this.getServiceById(registration.service_id);

  const { data, error } = await createCheckout(
    this.configService.get('LEMONSQUEEZY_STORE_ID'),
    this.configService.get('LEMONSQUEEZY_SERVICE_VARIANT_ID'),
    {
      customPrice: service.registration_fee * 100, // Convert to cents
      checkoutData: {
        email: registration.email,
        name: registration.full_name,
        billingAddress: { country: 'PK' },
        custom: {
          payment_type: 'service',
          reference_id: registration.reference_number,
          registration_id: registration.id,
          service_id: service.id,
        },
      },
      productOptions: {
        name: `${service.name} - Registration Fee`,
        description: `Registration fee for ${service.name}`,
        redirectUrl: `${this.configService.get('FRONTEND_URL')}/payment/success?type=service&ref=${registration.reference_number}`,
      },
    },
  );

  if (error) throw new BadGatewayException('Failed to create checkout');

  return { checkoutUrl: data.data.attributes.url };
}
```

---

## Central Webhook Router

Single endpoint handles all Lemon Squeezy webhooks, routing by event type and `custom_data.payment_type`:

```typescript
@Controller('webhooks')
export class WebhookController {
  @Post('lemonsqueezy')
  @Public()
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    // 1. Verify signature
    this.verifySignature(req);

    const payload = JSON.parse(req.rawBody.toString());
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data || {};

    // 2. Route by event type
    switch (eventName) {
      // One-time payment events
      case 'order_created':
        await this.handleOrderCreated(payload);
        break;
      case 'order_refunded':
        await this.handleOrderRefunded(payload);
        break;

      // Subscription lifecycle events
      case 'subscription_created':
        await this.subscriptionsService.handleSubscriptionCreated(payload);
        break;
      case 'subscription_updated':
        await this.subscriptionsService.handleSubscriptionUpdated(payload);
        break;
      case 'subscription_cancelled':
        await this.subscriptionsService.handleSubscriptionCancelled(payload);
        break;
      case 'subscription_expired':
        await this.subscriptionsService.handleSubscriptionExpired(payload);
        break;

      // Subscription payment events
      case 'subscription_payment_success':
        await this.subscriptionsService.handlePaymentSuccess(payload);
        break;
      case 'subscription_payment_failed':
        await this.subscriptionsService.handlePaymentFailed(payload);
        break;
      case 'subscription_payment_recovered':
        await this.subscriptionsService.handlePaymentRecovered(payload);
        break;

      default:
        this.logger.warn(`Unhandled webhook event: ${eventName}`);
    }

    return { received: true };
  }

  // Route order_created by payment_type
  private async handleOrderCreated(payload: any) {
    const paymentType = payload.meta.custom_data?.payment_type;
    switch (paymentType) {
      case 'consultation':
        return this.consultationsService.handlePaymentConfirmed(payload);
      case 'service':
        return this.serviceRegistrationsService.handlePaymentConfirmed(payload);
      default:
        this.logger.warn(`Unknown payment_type: ${paymentType}`);
    }
  }
}
```

---

## Database Schema Changes (vs Safepay)

### Rename columns in existing tables:

| Table | Old Column | New Column |
|---|---|---|
| `user_subscriptions` | `safepay_subscription_id` | `lemonsqueezy_subscription_id` |
| `user_subscriptions` | `safepay_customer_id` | `lemonsqueezy_customer_id` |
| `consultation_bookings` | `safepay_tracker_id` | `lemonsqueezy_checkout_id` |
| `consultation_bookings` | `safepay_transaction_id` | `lemonsqueezy_order_id` |
| `service_registrations` | `safepay_tracker_id` | `lemonsqueezy_checkout_id` |
| `service_registrations` | `safepay_transaction_id` | `lemonsqueezy_order_id` |
| `payments` | `safepay_transaction_id` | `lemonsqueezy_order_id` |
| `payments` | `safepay_tracker_id` | `lemonsqueezy_checkout_id` |

### New columns to add:

| Table | Column | Type | Description |
|---|---|---|---|
| `user_subscriptions` | `card_brand` | text | visa, mastercard, etc. |
| `user_subscriptions` | `card_last_four` | varchar(4) | Last 4 digits |
| `user_subscriptions` | `ends_at` | timestamptz | When cancelled sub expires |
| `user_subscriptions` | `lemonsqueezy_order_id` | text | Initial order ID |

---

## NestJS Module Structure

```
apps/api/src/payments/
├── payments.module.ts              # Registers all payment providers
├── lemonsqueezy.service.ts         # SDK wrapper (setup, checkout, subscription ops)
├── webhook.controller.ts           # POST /api/webhooks/lemonsqueezy
├── webhook-signature.guard.ts      # Signature verification guard
└── dto/
    ├── create-checkout.dto.ts
    ├── webhook-payload.dto.ts
    └── index.ts
```

### LemonSqueezyService (SDK Wrapper)

```typescript
@Injectable()
export class LemonSqueezyService implements OnModuleInit {
  private readonly logger = new Logger(LemonSqueezyService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    lemonSqueezySetup({
      apiKey: this.configService.get('LEMONSQUEEZY_API_KEY'),
      onError: (error) => this.logger.error('Lemon Squeezy error', error),
    });
  }

  get storeId(): number {
    return Number(this.configService.get('LEMONSQUEEZY_STORE_ID'));
  }

  async createOneTimeCheckout(params: {
    variantId: number;
    customPrice?: number;
    email: string;
    name: string;
    customData: Record<string, string>;
    redirectUrl: string;
    productName?: string;
    productDescription?: string;
  }) { ... }

  async createSubscriptionCheckout(params: {
    email: string;
    name: string;
    customData: Record<string, string>;
    redirectUrl: string;
  }) { ... }

  async cancelSubscription(subscriptionId: string) { ... }
  async resumeSubscription(subscriptionId: string) { ... }
  async getSubscription(subscriptionId: string) { ... }
  async getOrder(orderId: string) { ... }

  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean { ... }
}
```

---

## Comparison: Safepay vs Lemon Squeezy

| Feature | Safepay | Lemon Squeezy |
|---|---|---|
| **Payment model** | Payment gateway | Merchant of Record |
| **Tax handling** | AR-CO responsible | Lemon Squeezy handles |
| **Subscription management** | Limited (manual) | Full lifecycle built-in |
| **Checkout** | SDK-generated URL | Hosted/overlay page |
| **Webhook verification** | HMAC | HMAC (X-Signature header) |
| **Custom data** | Only `order_id` + `source` | Arbitrary key-value via `custom` |
| **Payment methods** | Cards, wallets (PK) | Cards, PayPal, Apple Pay (global) |
| **Currency** | PKR native | Multi-currency (PKR supported) |
| **SDK** | @sfpy/node-core + @sfpy/node-sdk | @lemonsqueezy/lemonsqueezy.js |
| **Retry on failure** | Manual | Automatic (4 retries over 2 weeks) |
| **Customer portal** | None | Built-in (pre-signed URLs) |
| **Refunds** | Manual | API-driven |

---

## Key Differences from Safepay Integration

1. **No tracker/session two-step flow** - Lemon Squeezy uses a single `createCheckout()` call that returns a URL directly
2. **No instrument mode** - No need to save cards separately; Lemon Squeezy handles recurring billing
3. **custom_data is flexible** - Any key-value pairs, unlike Safepay's `order_id` + `source` only
4. **Webhook payloads are richer** - Full object data in webhooks, not just IDs
5. **Subscription status is managed by Lemon Squeezy** - No need to manually track billing cycles
6. **Prices in cents** - PKR 700 = `70000`, PKR 50,000 = `5000000`
7. **rawBody required** - Must enable `rawBody: true` in NestJS for webhook signature verification
