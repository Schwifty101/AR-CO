# Testing Guide: Authentication & Authorization

## 🧪 Testing Strategy

This guide provides step-by-step instructions for testing the authentication and authorization system.

## Prerequisites

1. **Supabase Project Setup**: Ensure `.env` has valid Supabase credentials
2. **Development Server Running**: `cd apps/api && pnpm start:dev`
3. **User Account**: Create a test user in Supabase (or use existing)

## Phase 1: Manual Testing with cURL

### Step 1: Test Public Endpoint (No Auth)

**Should succeed without JWT:**
```bash
curl http://localhost:4000/api/hello
```

**Expected response:**
```json
{
  "message": "Hello World!"
}
```

### Step 2: Test Protected Endpoint (Missing JWT)

**Should fail with 401 Unauthorized:**
```bash
curl http://localhost:4000/api/profile
```

**Expected response:**
```json
{
  "statusCode": 401,
  "timestamp": "2024-01-24T...",
  "path": "/api/profile",
  "message": "Missing or invalid authorization header"
}
```

### Step 3: Get Valid JWT Token

**Option A: Using Supabase Client Library**
```typescript
// In your frontend or test script
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
});

const accessToken = data.session?.access_token;
console.log('JWT:', accessToken);
```

**Option B: Create Test User via SQL**
```sql
-- In Supabase SQL Editor
-- This creates a user and user_profile record

-- 1. Create auth user (replace with your email)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now()
);

-- 2. Create user profile
INSERT INTO user_profiles (user_id, full_name, phone_number, user_type)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'Test User',
  '+92-300-1234567',
  'client'
);
```

Then sign in via Supabase dashboard or client library to get JWT.

### Step 4: Test Protected Endpoint (With JWT)

**Should succeed with valid JWT:**
```bash
curl http://localhost:4000/api/profile \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Expected response:**
```json
{
  "message": "Hello, Test User!",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "userType": "client",
    "fullName": "Test User"
  }
}
```

### Step 5: Test Role-Based Access (Client User)

**Should fail with 403 Forbidden (client accessing admin route):**
```bash
curl http://localhost:4000/api/admin-dashboard \
  -H "Authorization: Bearer <CLIENT_JWT_TOKEN>"
```

**Expected response:**
```json
{
  "statusCode": 403,
  "timestamp": "2024-01-24T...",
  "path": "/api/admin-dashboard",
  "message": "Insufficient permissions"
}
```

### Step 6: Test Admin Access

**Create admin user:**
```sql
-- Update existing user to admin
UPDATE user_profiles
SET user_type = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

**Should succeed with admin JWT:**
```bash
# Get new JWT after changing user_type
curl http://localhost:4000/api/admin-dashboard \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

**Expected response:**
```json
{
  "message": "Welcome to admin dashboard",
  "user": {
    "email": "test@example.com",
    "userType": "admin"
  }
}
```

### Step 7: Test Admin Whitelist

**Configure admin whitelist in `.env`:**
```bash
ADMIN_EMAILS=personal.email@gmail.com
```

**Create user with whitelisted email:**
```sql
INSERT INTO user_profiles (user_id, full_name, user_type)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'personal.email@gmail.com'),
  'Personal User',
  'client'  -- Note: user_type is 'client'
);
```

**Test access to admin route:**
```bash
# User has user_type='client' but email is whitelisted
curl http://localhost:4000/api/admin-dashboard \
  -H "Authorization: Bearer <WHITELISTED_EMAIL_JWT>"
```

**Should succeed (whitelist bypass):**
```json
{
  "message": "Welcome to admin dashboard",
  "user": {
    "email": "personal.email@gmail.com",
    "userType": "client"
  }
}
```

## Phase 2: Integration Testing

### Create Test Suite

**File: `src/app.controller.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public Routes', () => {
    it('/api/hello (GET) - should be accessible without JWT', () => {
      return request(app.getHttpServer())
        .get('/api/hello')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('Protected Routes', () => {
    it('/api/profile (GET) - should reject without JWT', () => {
      return request(app.getHttpServer())
        .get('/api/profile')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('authorization');
        });
    });

    it('/api/profile (GET) - should reject with invalid JWT', () => {
      return request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    // TODO: Add test with valid JWT (requires test user setup)
  });

  describe('Role-Based Access', () => {
    it('/api/admin-dashboard (GET) - should reject without JWT', () => {
      return request(app.getHttpServer())
        .get('/api/admin-dashboard')
        .expect(401);
    });

    // TODO: Add tests with client JWT (403) and admin JWT (200)
  });
});
```

**Run tests:**
```bash
cd apps/api
pnpm test
```

## Phase 3: Error Handling Tests

### Test Supabase Error Mapping

**Unique constraint violation (409 Conflict):**
```typescript
// Create duplicate email
const { error } = await supabase
  .from('user_profiles')
  .insert({ email: 'existing@example.com' });
// Should return 409 Conflict
```

**Row not found (404 Not Found):**
```typescript
// Query non-existent record
const { data, error } = await supabase
  .from('cases')
  .select()
  .eq('id', 'non-existent-uuid')
  .single();
// Should return 404 Not Found
```

## Phase 4: Load Testing (Optional)

### Test Authentication Performance

**Using Apache Bench:**
```bash
# Test public endpoint (baseline)
ab -n 1000 -c 10 http://localhost:4000/api/hello

# Test protected endpoint (with JWT overhead)
ab -n 1000 -c 10 \
  -H "Authorization: Bearer <JWT>" \
  http://localhost:4000/api/profile
```

**Expected results:**
- Public endpoint: ~1000 req/sec
- Protected endpoint: ~500-800 req/sec (JWT validation overhead)

## Phase 5: Security Testing

### Test JWT Validation

**Invalid signature:**
```bash
# Tamper with JWT
curl http://localhost:4000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TAMPERED.SIGNATURE"
```
**Expected:** 401 Unauthorized

**Expired token:**
```bash
# Use old token (> 15 minutes old)
curl http://localhost:4000/api/profile \
  -H "Authorization: Bearer <EXPIRED_JWT>"
```
**Expected:** 401 Unauthorized

**Missing Bearer prefix:**
```bash
curl http://localhost:4000/api/profile \
  -H "Authorization: <JWT_WITHOUT_BEARER>"
```
**Expected:** 401 Unauthorized

### Test Role Bypass Attempts

**Client trying admin route:**
```bash
# Client user attempts admin endpoint
curl http://localhost:4000/api/admin-dashboard \
  -H "Authorization: Bearer <CLIENT_JWT>"
```
**Expected:** 403 Forbidden

**Tampering with JWT claims (should fail):**
```bash
# Modify JWT payload to change user_type
# Should fail signature validation
```
**Expected:** 401 Unauthorized

## Phase 6: CORS Testing

### Test CORS Headers

**Allowed origin:**
```bash
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:4000/api/hello
```
**Expected:** CORS headers present

**Disallowed origin:**
```bash
curl -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:4000/api/hello
```
**Expected:** CORS error or no CORS headers

## Common Issues & Solutions

### Issue: "Missing or invalid authorization header"

**Cause:** JWT not in request header
**Solution:** Add `Authorization: Bearer <token>` header

### Issue: "Authentication failed"

**Cause:** Invalid or expired JWT
**Solution:** Get fresh JWT from Supabase auth

### Issue: "Insufficient permissions"

**Cause:** User lacks required role
**Solution:** Update user_type in user_profiles table or add to admin whitelist

### Issue: "User profile not found"

**Cause:** JWT valid but no user_profiles record
**Solution:** Create user_profiles entry for the auth user

### Issue: CORS errors in browser

**Cause:** Origin not in CORS_ORIGINS
**Solution:** Add origin to CORS_ORIGINS env var

## Verification Checklist

- [ ] Public endpoint accessible without JWT
- [ ] Protected endpoint requires JWT
- [ ] Invalid JWT returns 401
- [ ] Expired JWT returns 401
- [ ] Client user cannot access admin routes (403)
- [ ] Admin user can access admin routes (200)
- [ ] Whitelisted email bypasses role restrictions
- [ ] Supabase errors mapped to correct HTTP codes
- [ ] CORS works for configured origins
- [ ] TypeScript compilation succeeds

## Next Steps

After all tests pass:

1. **Add more test endpoints** for future modules
2. **Create unit tests** for guards and services
3. **Set up CI/CD pipeline** for automated testing
4. **Implement auth module** (signup, login, refresh)
5. **Add rate limiting** for security

## Resources

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [JWT.io Debugger](https://jwt.io/) - Decode and verify JWTs
- [Postman](https://www.postman.com/) - API testing tool
