# RLS Policy Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix RLS policies on 5 newer tables (consultation_bookings, subscription_events, subscription_payments, subscription_plans, user_subscriptions) to match the optimized naming convention, InitPlan pattern, and proper security.

**Architecture:** Single atomic Supabase migration that drops 10 old policies and creates 10 new consolidated policies. All new policies use `(select auth.uid())` InitPlan pattern and `{action}_{table}` naming convention. Backend is unaffected (uses admin client exclusively).

**Tech Stack:** Supabase MCP (apply_migration, execute_sql, get_advisors)

**Design Doc:** `docs/plans/2026-03-04-rls-policy-cleanup-design.md`

---

### Task 1: Verify Current Policy State

**Step 1: Count existing policies on target tables**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT tablename, count(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('consultation_bookings', 'subscription_events', 'subscription_payments', 'subscription_plans', 'user_subscriptions')
GROUP BY tablename
ORDER BY tablename;
```

Expected:
| tablename | policy_count |
|-----------|-------------|
| consultation_bookings | 2 |
| subscription_events | 2 |
| subscription_payments | 2 |
| subscription_plans | 1 |
| user_subscriptions | 3 |

**Step 2: Verify no other policies exist that we missed**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('consultation_bookings', 'subscription_events', 'subscription_payments', 'subscription_plans', 'user_subscriptions')
ORDER BY tablename, cmd;
```

Expected 10 rows with the verbose-named policies documented in the design doc.

---

### Task 2: Apply the Migration

**Step 1: Apply migration via Supabase MCP**

Use `mcp__supabase__apply_migration` with name `optimize_newer_table_rls_policies`.

The migration SQL (note: MCP handles transaction wrapping, do NOT include BEGIN/COMMIT):

```sql
-- ============================================================
-- Phase 1: DROP existing policies on 5 newer tables (10 total)
-- ============================================================

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

-- ============================================================
-- Phase 2: CREATE optimized policies (10 total)
-- All use (select auth.uid()) InitPlan pattern
-- All follow {action}_{table_name} naming convention
-- ============================================================

-- ---- consultation_bookings (2 policies) ----

-- INSERT: service_role only (backend creates bookings)
CREATE POLICY "insert_consultation_bookings" ON "public"."consultation_bookings"
  FOR INSERT WITH CHECK (
    (select auth.role()) = 'service_role'
  );

-- SELECT: staff sees all, no public read access
CREATE POLICY "select_consultation_bookings" ON "public"."consultation_bookings"
  FOR SELECT USING (
    "private"."is_staff"((select "auth"."uid"()))
  );

-- ---- subscription_events (2 policies) ----

-- INSERT: staff/admin only (backend logs events via webhook handlers)
CREATE POLICY "insert_subscription_events" ON "public"."subscription_events"
  FOR INSERT WITH CHECK (
    "private"."is_staff"((select "auth"."uid"()))
  );

-- SELECT: users see events for own subscriptions, staff sees all
CREATE POLICY "select_subscription_events" ON "public"."subscription_events"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "public"."user_subscriptions"
      WHERE "user_subscriptions"."id" = "subscription_events"."subscription_id"
        AND "user_subscriptions"."user_id" = (select "auth"."uid"())
    )
    OR "private"."is_staff"((select "auth"."uid"()))
  );

-- ---- subscription_payments (2 policies) ----

-- INSERT: staff/admin only
CREATE POLICY "insert_subscription_payments" ON "public"."subscription_payments"
  FOR INSERT WITH CHECK (
    "private"."is_staff"((select "auth"."uid"()))
  );

-- SELECT: users see own via subscription ownership, staff sees all
CREATE POLICY "select_subscription_payments" ON "public"."subscription_payments"
  FOR SELECT USING (
    "subscription_id" IN (
      SELECT "s"."id" FROM "public"."subscriptions" "s"
      WHERE "s"."client_profile_id" = "private"."get_client_profile_id"((select "auth"."uid"()))
    )
    OR "private"."is_staff"((select "auth"."uid"()))
  );

-- ---- subscription_plans (1 policy) ----

-- SELECT: anyone can view active plans (public catalog, no auth needed)
CREATE POLICY "select_subscription_plans" ON "public"."subscription_plans"
  FOR SELECT USING ("is_active" = true);

-- ---- user_subscriptions (3 policies) ----

-- SELECT: users see own, staff sees all
CREATE POLICY "select_user_subscriptions" ON "public"."user_subscriptions"
  FOR SELECT USING (
    "user_id" = (select "auth"."uid"())
    OR "private"."is_staff"((select "auth"."uid"()))
  );

-- INSERT: users create own, staff creates for anyone
CREATE POLICY "insert_user_subscriptions" ON "public"."user_subscriptions"
  FOR INSERT WITH CHECK (
    "user_id" = (select "auth"."uid"())
    OR "private"."is_staff"((select "auth"."uid"()))
  );

-- UPDATE: staff only (webhook processing updates subscriptions)
CREATE POLICY "update_user_subscriptions" ON "public"."user_subscriptions"
  FOR UPDATE USING (
    "private"."is_staff"((select "auth"."uid"()))
  );
```

**Step 2: Verify migration was recorded**

Use `mcp__supabase__list_migrations` and confirm `optimize_newer_table_rls_policies` appears in the list.

---

### Task 3: Verify Results

Run all 4 verification checks in parallel.

**Step 1: Run security advisors**

Use `mcp__supabase__get_advisors` with type `security`.
Expected: No new RLS-related warnings (only pre-existing `auth_leaked_password_protection`).

**Step 2: Run performance advisors**

Use `mcp__supabase__get_advisors` with type `performance`.
Expected: No `auth_rls_initplan` or `multiple_permissive_policies` warnings. Only pre-existing `unused_index` (INFO level).

**Step 3: Verify policy counts**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT tablename, count(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('consultation_bookings', 'subscription_events', 'subscription_payments', 'subscription_plans', 'user_subscriptions')
GROUP BY tablename
ORDER BY tablename;
```

Expected:
| tablename | policy_count |
|-----------|-------------|
| consultation_bookings | 2 |
| subscription_events | 2 |
| subscription_payments | 2 |
| subscription_plans | 1 |
| user_subscriptions | 3 |

**Step 4: Verify naming convention**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('consultation_bookings', 'subscription_events', 'subscription_payments', 'subscription_plans', 'user_subscriptions')
ORDER BY tablename, cmd;
```

Expected all 10 policies follow `{action}_{table_name}` format:
- `insert_consultation_bookings`, `select_consultation_bookings`
- `insert_subscription_events`, `select_subscription_events`
- `insert_subscription_payments`, `select_subscription_payments`
- `select_subscription_plans`
- `insert_user_subscriptions`, `select_user_subscriptions`, `update_user_subscriptions`

**Step 5: Verify total policy count across all public tables**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT count(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';
```

Expected: 82 total (unchanged — we dropped 10 and created 10).

---

### Task 4: Save Migration File Locally & Commit

**Step 1: Create local migration file**

Write the SQL from Task 2 Step 1 to:
`supabase/migrations/20260304_optimize_newer_table_rls_policies.sql`

This preserves the migration in version control matching what was applied via MCP.

**Step 2: Commit**

```bash
git add -f supabase/migrations/20260304_optimize_newer_table_rls_policies.sql
git commit -m "fix(db): optimize RLS policies on 5 newer tables

Drop 10 old policies with verbose names and security gaps (overly
permissive ALL policies on subscription_events, user_subscriptions;
open SELECT on consultation_bookings). Replace with 10 consolidated
policies using {action}_{table} naming and (select auth.uid())
InitPlan pattern.

Completes HEAD TASK 14 cleanup."
```

---

### Task 5: Update init.md Checklist

**Step 1: Mark HEAD TASK 14 as complete in init.md**

Update the verification checklist item:
```
- [X] Database RLS optimized (HEAD TASK 14)
```

Mark all sub-tasks 14.1-14.4 as complete (original work was already done; this finishes the remaining cleanup).

**Step 2: Commit**

```bash
git add init.md
git commit -m "docs: mark HEAD TASK 14 as complete"
```
