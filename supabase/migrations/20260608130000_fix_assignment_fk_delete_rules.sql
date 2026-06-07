-- Fix assignment FK constraints: NO ACTION → SET NULL
-- Allows deleting attorneys/staff who have assigned cases, complaints, or registrations.
-- Assigned records become unassigned rather than blocking deletion.

-- ── cases.assigned_to_id ────────────────────────────────────────────────────
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_assigned_to_id_fkey;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_assigned_to_id_fkey
  FOREIGN KEY (assigned_to_id)
  REFERENCES public.user_profiles(id)
  ON DELETE SET NULL;

-- ── complaints.assigned_to_id ───────────────────────────────────────────────
ALTER TABLE public.complaints
  DROP CONSTRAINT IF EXISTS complaints_assigned_to_id_fkey;

ALTER TABLE public.complaints
  ADD CONSTRAINT complaints_assigned_to_id_fkey
  FOREIGN KEY (assigned_to_id)
  REFERENCES public.user_profiles(id)
  ON DELETE SET NULL;

-- ── service_registrations.assigned_to_id ────────────────────────────────────
ALTER TABLE public.service_registrations
  DROP CONSTRAINT IF EXISTS service_registrations_assigned_to_id_fkey;

ALTER TABLE public.service_registrations
  ADD CONSTRAINT service_registrations_assigned_to_id_fkey
  FOREIGN KEY (assigned_to_id)
  REFERENCES public.user_profiles(id)
  ON DELETE SET NULL;
