# HEAD TASK 14: RLS Policy Cleanup — Design Doc

**Date:** 2026-03-04
**Status:** Approved
**Scope:** Fix RLS policies on 5 newer tables added after original optimization

## Context

HEAD TASK 14 originally targeted 130+ Supabase linter warnings:
- 62 `auth_rls_initplan` (auth.uid() per-row evaluation)
- 63+ `multiple_permissive_policies` (overlapping permissive policies)
- 5 `duplicate_index` (redundant indexes)

**All original issues are resolved.** The original 88 policies across 22 tables were consolidated to 79 optimized policies, and 5 duplicate indexes were dropped.

However, 5 tables added after the optimization have inconsistent policies:
- `consultation_bookings`
- `subscription_events`
- `subscription_payments`
- `subscription_plans`
- `user_subscriptions`

## Problems Found

### 1. Overly Permissive ALL Policies

`subscription_events` and `user_subscriptions` have `ALL` policies with `qual=true, with_check=true`. Any authenticated user can CRUD all rows — a security gap if someone bypasses the NestJS backend and queries Supabase directly.

### 2. Consultation Bookings Open Read

`consultation_bookings` SELECT policy uses `qual=true` — any user can read all bookings including other users' PII (name, email, phone, issue summary).

### 3. Naming Convention Mismatch

Policies use verbose names ("Service role can create consultation bookings") instead of the established `{action}_{table_name}` convention.

### 4. Missing InitPlan Pattern

Some policies already use `(select auth.uid())` but the pattern is inconsistent.

## Backend Access Pattern

All 5 tables are accessed exclusively via `getAdminClient()` (service_role key, bypasses RLS). RLS policies serve as defense-in-depth only.

| Table | Service | Client | Operations |
|-------|---------|--------|------------|
| subscription_plans | SubscriptionsService | Admin | SELECT, UPDATE |
| user_subscriptions | SubscriptionsService | Admin | SELECT, INSERT, UPDATE |
| subscription_events | SubscriptionsService | Admin | SELECT, INSERT |
| consultation_bookings | ConsultationsService | Admin | SELECT, INSERT, UPDATE |
| subscription_payments | (Not actively used) | — | — |

## Migration Design

### Phase 1: DROP Existing Policies (8 statements)

```sql
-- consultation_bookings (2)
DROP POLICY IF EXISTS "Service role can create consultation bookings" ON "public"."consultation_bookings";
DROP POLICY IF EXISTS "Anyone can view their own bookings by email" ON "public"."consultation_bookings";

-- subscription_events (2)
DROP POLICY IF EXISTS "Service role full access to subscription_events" ON "public"."subscription_events";
DROP POLICY IF EXISTS "Users can view own subscription events" ON "public"."subscription_events";

-- subscription_payments (2)
DROP POLICY IF EXISTS "Staff can insert subscription payments" ON "public"."subscription_payments";
DROP POLICY IF EXISTS "select_subscription_payments" ON "public"."subscription_payments";

-- subscription_plans (1)
DROP POLICY IF EXISTS "Anyone can view active plans" ON "public"."subscription_plans";

-- user_subscriptions (3)
DROP POLICY IF EXISTS "Service role full access to user_subscriptions" ON "public"."user_subscriptions";
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON "public"."user_subscriptions";
DROP POLICY IF EXISTS "Users can view own subscriptions" ON "public"."user_subscriptions";
```

### Phase 2: CREATE Consolidated Policies (10 statements)

#### consultation_bookings (2 policies)

```sql
-- INSERT: service_role only (backend creates bookings)
CREATE POLICY "insert_consultation_bookings" ON "public"."consultation_bookings"
  FOR INSERT WITH CHECK (
    (select auth.role()) = 'service_role'
  );

-- SELECT: staff sees all, no public read access
CREATE POLICY "select_consultation_bookings" ON "public"."consultation_bookings"
  FOR SELECT USING (
    private.is_staff((select auth.uid()))
  );
```

#### subscription_events (2 policies)

```sql
-- INSERT: staff/admin only (backend logs events via webhook handlers)
CREATE POLICY "insert_subscription_events" ON "public"."subscription_events"
  FOR INSERT WITH CHECK (
    private.is_staff((select auth.uid()))
  );

-- SELECT: users see events for own subscriptions, staff sees all
CREATE POLICY "select_subscription_events" ON "public"."subscription_events"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_subscriptions.id = subscription_events.subscription_id
        AND user_subscriptions.user_id = (select auth.uid())
    )
    OR private.is_staff((select auth.uid()))
  );
```

#### subscription_payments (2 policies)

```sql
-- INSERT: staff/admin only
CREATE POLICY "insert_subscription_payments" ON "public"."subscription_payments"
  FOR INSERT WITH CHECK (
    private.is_staff((select auth.uid()))
  );

-- SELECT: users see own via subscription ownership, staff sees all
CREATE POLICY "select_subscription_payments" ON "public"."subscription_payments"
  FOR SELECT USING (
    subscription_id IN (
      SELECT s.id FROM subscriptions s
      WHERE s.client_profile_id = private.get_client_profile_id((select auth.uid()))
    )
    OR private.is_staff((select auth.uid()))
  );
```

#### subscription_plans (1 policy)

```sql
-- SELECT: anyone can view active plans (public catalog)
CREATE POLICY "select_subscription_plans" ON "public"."subscription_plans"
  FOR SELECT USING (is_active = true);
```

#### user_subscriptions (3 policies)

```sql
-- SELECT: users see own, staff sees all
CREATE POLICY "select_user_subscriptions" ON "public"."user_subscriptions"
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR private.is_staff((select auth.uid()))
  );

-- INSERT: users create own, staff creates for anyone
CREATE POLICY "insert_user_subscriptions" ON "public"."user_subscriptions"
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
    OR private.is_staff((select auth.uid()))
  );

-- UPDATE: staff only (webhook processing updates subscriptions)
CREATE POLICY "update_user_subscriptions" ON "public"."user_subscriptions"
  FOR UPDATE USING (
    private.is_staff((select auth.uid()))
  );
```

## Unused Indexes Decision

28 unused indexes (INFO-level) were identified. These are all FK indexes and filtering indexes that show as "unused" due to early-stage low traffic. **Decision: Keep all.** They will be needed in production for JOIN performance, cascading deletes, and filtered queries.

## Verification Plan

1. Run `get_advisors` (security + performance) — 0 new warnings introduced
2. Verify total policy count on affected tables matches expected
3. Verify naming convention compliance
4. Confirm no duplicate index warnings
5. Backend endpoints unaffected (all use admin client)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Policy breaks direct Supabase access | Low | Low | Backend uses admin client; RLS is defense-in-depth only |
| Migration fails | Very Low | Low | Atomic transaction; IF EXISTS guards |
| New policies too restrictive | Low | None | Backend bypasses RLS; only affects direct SDK access |
