# LemonSqueezy Production Setup

## 1. Products to Create

### A. Subscription Plan
- **Name:** AR&CO Premium Plan
- **Type:** Subscription
- **Price:** PKR 700 / month
- **Billing:** Monthly
- Note down the **Variant ID** → `LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID`

---

### B. Legal Consultation
- **Name:** Legal Consultation Fee
- **Type:** Single payment
- **Price:** PKR 50,000 (fixed)
- Note down the **Variant ID** → `LEMONSQUEEZY_CONSULTATION_VARIANT_ID`

---

### C. Facilitation Service — Standard
- **Name:** Facilitation Service
- **Type:** Single payment
- **Price:** PKR 5,400
- Note down the **Variant ID** → `LEMONSQUEEZY_SERVICE_VARIANT_ID`

---

### D. Facilitation Service — With Government Charges
- Add a **second variant** to the same Facilitation Service product (or create a new product)
- **Name:** Facilitation Service (with Govt. Charges)
- **Type:** Single payment
- **Price:** PKR 8,400
- Note down the **Variant ID** → `LEMONSQUEEZY_SERVICE_GOVT_VARIANT_ID`

---

## 2. Redirect / Confirmation URLs

For each product, under **Product Options**, set:
- **Redirect URL** — leave blank (the backend sets this per-checkout via the API)
- **Receipt button text** — e.g. `Go to Dashboard`
- **Receipt link URL** — your production frontend URL, e.g. `https://ar-co.vercel.app`

---

## 3. Webhook Setup

Go to **Settings → Webhooks → Add webhook**.

| Field | Value |
|-------|-------|
| URL | `https://<your-railway-backend>/api/payments/webhook` |
| Signing secret | A strong random string (save it — this becomes `LEMONSQUEEZY_WEBHOOK_SECRET`) |

**Events to enable:**

| Event | Required for |
|-------|-------------|
| `order_created` | One-time payment confirmation (consultation, service) |
| `order_refunded` | Refund handling |
| `subscription_created` | New subscription activation |
| `subscription_updated` | Plan changes |
| `subscription_cancelled` | Cancellation tracking |
| `subscription_resumed` | Reactivation |
| `subscription_expired` | Expiry handling |
| `subscription_payment_success` | Renewal confirmation |
| `subscription_payment_failed` | Failed renewal alerts |
| `subscription_payment_refunded` | Subscription refund handling |

---

## 4. Find Your Store ID

The Store ID is not visible in the dashboard UI. Retrieve it via the API:

```bash
curl -X GET "https://api.lemonsqueezy.com/v1/stores" \
  -H "Accept: application/vnd.api+json" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

The `id` field in the response is your `LEMONSQUEEZY_STORE_ID`.

---

## 5. Backend Environment Variables

Add these to your Railway backend environment:

```env
LEMONSQUEEZY_API_KEY=eyJ0...          # From Settings → API Keys
LEMONSQUEEZY_STORE_ID=318521          # From the API call above
LEMONSQUEEZY_WEBHOOK_SECRET=          # The signing secret you set on the webhook

LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID= # Variant ID of the subscription plan
LEMONSQUEEZY_CONSULTATION_VARIANT_ID= # Variant ID of the consultation product
LEMONSQUEEZY_SERVICE_VARIANT_ID=      # Variant ID of the standard service (PKR 5,400)
LEMONSQUEEZY_SERVICE_GOVT_VARIANT_ID= # Variant ID of the govt-charges service (PKR 8,400)

FRONTEND_URL=https://ar-co.vercel.app # Your production frontend domain
```

---

## 6. Notes on Pricing

- All prices are passed in **paisa** (PKR × 100) when using the `customPrice` API parameter. For example, PKR 5,400 = `540000`.
- The **Consultation** product uses its fixed price set in the dashboard — no `customPrice` override is used.
- For **services**, the backend selects the correct variant (standard vs govt) based on the amount the frontend sends, and passes `customPrice` to ensure the checkout shows the exact fee.
- PKR is treated as a **2-decimal currency** by LemonSqueezy (uses paisa as the smallest unit).
