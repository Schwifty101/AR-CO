-- ============================================================================
-- Manual payment migration
--   - Adds 'awaiting_confirmation' and 'flagged' payment-status values
--   - Adds screenshot proof + admin-review audit columns to both flows
--   - Creates the private `payment-proofs` storage bucket
-- ============================================================================

-- ── 1. Extend enum-backed payment_status columns (no-op if column is TEXT) ──
DO $$
DECLARE
  v_udt text;
  v_val text;
  v_cols text[][] := ARRAY[
    ARRAY['service_registrations', 'payment_status'],
    ARRAY['consultation_bookings', 'payment_status']
  ];
  v_row  text[];
BEGIN
  FOREACH v_row SLICE 1 IN ARRAY v_cols LOOP
    SELECT udt_name INTO v_udt
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name  = v_row[1]
      AND column_name = v_row[2]
      AND data_type   = 'USER-DEFINED';

    IF v_udt IS NOT NULL THEN
      FOREACH v_val IN ARRAY ARRAY['awaiting_confirmation', 'flagged'] LOOP
        EXECUTE format(
          'ALTER TYPE public.%I ADD VALUE IF NOT EXISTS %L', v_udt, v_val
        );
      END LOOP;
      RAISE NOTICE 'Extended enum % for %.%', v_udt, v_row[1], v_row[2];
    ELSE
      RAISE NOTICE 'Column %.% is not enum-backed — no enum change needed', v_row[1], v_row[2];
    END IF;
  END LOOP;
END $$;

-- ── 2. service_registrations: proof + audit columns ─────────────────────────
ALTER TABLE "public"."service_registrations"
  ADD COLUMN IF NOT EXISTS "payment_proof_path"  TEXT,
  ADD COLUMN IF NOT EXISTS "payment_method"       TEXT DEFAULT 'bank_transfer',
  ADD COLUMN IF NOT EXISTS "payment_review_note"  TEXT,
  ADD COLUMN IF NOT EXISTS "payment_confirmed_by" UUID REFERENCES "public"."user_profiles"("id"),
  ADD COLUMN IF NOT EXISTS "payment_confirmed_at" TIMESTAMPTZ;

-- ── 3. consultation_bookings: proof + audit columns ─────────────────────────
ALTER TABLE "public"."consultation_bookings"
  ADD COLUMN IF NOT EXISTS "payment_proof_path"  TEXT,
  ADD COLUMN IF NOT EXISTS "payment_method"       TEXT DEFAULT 'bank_transfer',
  ADD COLUMN IF NOT EXISTS "payment_review_note"  TEXT,
  ADD COLUMN IF NOT EXISTS "payment_confirmed_by" UUID REFERENCES "public"."user_profiles"("id"),
  ADD COLUMN IF NOT EXISTS "payment_confirmed_at" TIMESTAMPTZ;

-- ── 4. Private storage bucket for payment screenshots ───────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;
