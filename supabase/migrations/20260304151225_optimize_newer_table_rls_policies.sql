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
