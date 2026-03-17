# Lemon Squeezy API Reference

**Base URL:** `https://api.lemonsqueezy.com/v1`

**Authentication:** Bearer token via `Authorization: Bearer {API_KEY}` header.

**Format:** All requests/responses use JSON:API encoding.

---

## Authentication

```http
Authorization: Bearer {LEMONSQUEEZY_API_KEY}
Accept: application/vnd.api+json
Content-Type: application/vnd.api+json
```

Generate API keys from: Lemon Squeezy Dashboard > Settings > API.

Separate keys exist for **test mode** and **live mode**.

---

## Core Resources

### Users (Authenticated User)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/users/me` | Get authenticated user |

### Stores

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/stores` | List all stores |
| GET | `/v1/stores/{id}` | Retrieve a store |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/customers` | Create a customer |
| GET | `/v1/customers/{id}` | Retrieve a customer |
| PATCH | `/v1/customers/{id}` | Update a customer |
| GET | `/v1/customers` | List all customers |

**Customer Object:**
```json
{
  "data": {
    "type": "customers",
    "id": "1",
    "attributes": {
      "store_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "city": "Islamabad",
      "region": "ICT",
      "country": "PK",
      "status": "subscribed",
      "total_revenue_currency": 84332,
      "total_revenue_currency_formatted": "$843.32",
      "mrr": 70000,
      "mrr_formatted": "$700.00",
      "urls": {
        "customer_portal": "https://..."
      },
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z",
      "test_mode": false
    }
  }
}
```

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/products` | List all products |
| GET | `/v1/products/{id}` | Retrieve a product |

### Variants

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/variants` | List all variants |
| GET | `/v1/variants/{id}` | Retrieve a variant |

**Note:** Every product has at least one variant. The variant determines the price and billing type (one-time vs subscription).

### Prices

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/prices` | List all prices |
| GET | `/v1/prices/{id}` | Retrieve a price |

---

## Payment Resources

### Checkouts

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/checkouts` | Create a checkout |
| GET | `/v1/checkouts/{id}` | Retrieve a checkout |
| GET | `/v1/checkouts` | List all checkouts |

See [Checkout Integration](./checkout-integration.md) for detailed usage.

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/orders` | List all orders |
| GET | `/v1/orders/{id}` | Retrieve an order |
| POST | `/v1/orders/{id}/refund` | Issue a refund |
| POST | `/v1/orders/{id}/generate-invoice` | Generate invoice |

**Order Object:**
```json
{
  "data": {
    "type": "orders",
    "id": "1",
    "attributes": {
      "store_id": 1,
      "customer_id": 1,
      "identifier": "uuid-here",
      "order_number": 1001,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "currency": "PKR",
      "subtotal": 5000000,
      "setup_fee": 0,
      "discount_total": 0,
      "tax": 0,
      "total": 5000000,
      "total_formatted": "PKR 50,000.00",
      "refunded_amount": 0,
      "status": "paid",
      "refunded": false,
      "first_order_item": {
        "product_name": "Consultation Fee",
        "variant_name": "Default",
        "price": 5000000
      },
      "urls": {
        "receipt": "https://..."
      },
      "created_at": "2024-01-01T00:00:00.000000Z",
      "test_mode": false
    }
  }
}
```

**Order Status Values:**
- `pending` - Awaiting payment
- `failed` - Payment failed
- `paid` - Successfully paid
- `refunded` - Fully refunded
- `partial_refund` - Partially refunded
- `fraudulent` - Flagged as suspicious

### Order Items

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/order-items` | List all order items |
| GET | `/v1/order-items/{id}` | Retrieve an order item |

---

## Subscription Resources

### Subscriptions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/subscriptions` | List all subscriptions |
| GET | `/v1/subscriptions/{id}` | Retrieve a subscription |
| PATCH | `/v1/subscriptions/{id}` | Update a subscription |
| DELETE | `/v1/subscriptions/{id}` | Cancel a subscription |

See [Subscription Management](./subscription-management.md) for detailed usage.

### Subscription Invoices

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/subscription-invoices` | List all subscription invoices |
| GET | `/v1/subscription-invoices/{id}` | Retrieve a subscription invoice |
| POST | `/v1/subscription-invoices/{id}/generate-invoice` | Generate invoice |
| POST | `/v1/subscription-invoices/{id}/refund` | Issue refund |

### Subscription Items

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/subscription-items` | List all subscription items |
| GET | `/v1/subscription-items/{id}` | Retrieve a subscription item |
| PATCH | `/v1/subscription-items/{id}` | Update a subscription item |
| GET | `/v1/subscription-items/{id}/current-usage` | Get current usage |

### Usage Records

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/usage-records` | Create a usage record |
| GET | `/v1/usage-records/{id}` | Retrieve a usage record |
| GET | `/v1/usage-records` | List all usage records |

---

## Discount Resources

### Discounts

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/discounts` | Create a discount |
| GET | `/v1/discounts/{id}` | Retrieve a discount |
| DELETE | `/v1/discounts/{id}` | Delete a discount |
| GET | `/v1/discounts` | List all discounts |

### Discount Redemptions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/discount-redemptions/{id}` | Retrieve a redemption |
| GET | `/v1/discount-redemptions` | List all redemptions |

---

## Webhook Resources

### Webhooks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/webhooks` | Create a webhook |
| GET | `/v1/webhooks/{id}` | Retrieve a webhook |
| PATCH | `/v1/webhooks/{id}` | Update a webhook |
| DELETE | `/v1/webhooks/{id}` | Delete a webhook |
| GET | `/v1/webhooks` | List all webhooks |

See [Webhooks](./webhooks.md) for event types and verification.

---

## Filtering & Pagination

### Filtering
```
GET /v1/subscriptions?filter[store_id]=1&filter[status]=active
```

### Pagination
```
GET /v1/orders?page[number]=2&page[size]=25
```

### Including Related Resources
```
GET /v1/orders/{id}?include=customer,order-items
```

---

## Error Responses

Errors follow JSON:API error format:
```json
{
  "errors": [
    {
      "status": "422",
      "title": "Invalid Attribute",
      "detail": "The variant_id field is required."
    }
  ]
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No content (successful delete)
- `401` - Unauthorized (invalid/missing API key)
- `404` - Not found
- `422` - Validation error
- `429` - Rate limited
- `500` - Server error
