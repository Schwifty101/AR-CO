


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "private" IS 'Private schema for internal utility functions used by RLS policies';



COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."activity_type" AS ENUM (
    'case_created',
    'status_changed',
    'attorney_assigned',
    'document_uploaded',
    'note_added',
    'hearing_scheduled',
    'payment_received',
    'other'
);


ALTER TYPE "public"."activity_type" OWNER TO "postgres";


CREATE TYPE "public"."appointment_status" AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'no_show'
);


ALTER TYPE "public"."appointment_status" OWNER TO "postgres";


CREATE TYPE "public"."appointment_type" AS ENUM (
    'consultation',
    'follow_up',
    'hearing_prep',
    'document_review',
    'other'
);


ALTER TYPE "public"."appointment_type" OWNER TO "postgres";


CREATE TYPE "public"."case_priority" AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE "public"."case_priority" OWNER TO "postgres";


CREATE TYPE "public"."case_status" AS ENUM (
    'pending',
    'active',
    'on_hold',
    'resolved',
    'closed'
);


ALTER TYPE "public"."case_status" OWNER TO "postgres";


CREATE TYPE "public"."complaint_status" AS ENUM (
    'submitted',
    'under_review',
    'escalated',
    'resolved',
    'closed'
);


ALTER TYPE "public"."complaint_status" OWNER TO "postgres";


CREATE TYPE "public"."document_type" AS ENUM (
    'contract',
    'agreement',
    'court_filing',
    'evidence',
    'correspondence',
    'invoice_document',
    'client_id',
    'other'
);


ALTER TYPE "public"."document_type" OWNER TO "postgres";


CREATE TYPE "public"."interaction_type" AS ENUM (
    'call',
    'email',
    'meeting',
    'whatsapp',
    'other'
);


ALTER TYPE "public"."interaction_type" OWNER TO "postgres";


CREATE TYPE "public"."invoice_status" AS ENUM (
    'draft',
    'sent',
    'paid',
    'overdue',
    'cancelled'
);


ALTER TYPE "public"."invoice_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'card',
    'mobile_wallet',
    'bank_transfer',
    'cash',
    'other'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."post_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE "public"."post_status" OWNER TO "postgres";


CREATE TYPE "public"."service_registration_payment_status" AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE "public"."service_registration_payment_status" OWNER TO "postgres";


CREATE TYPE "public"."service_registration_status" AS ENUM (
    'pending_payment',
    'paid',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."service_registration_status" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status" AS ENUM (
    'pending',
    'active',
    'past_due',
    'cancelled',
    'expired'
);


ALTER TYPE "public"."subscription_status" OWNER TO "postgres";


CREATE TYPE "public"."user_type" AS ENUM (
    'client',
    'attorney',
    'staff',
    'admin'
);


ALTER TYPE "public"."user_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."generate_case_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_case_number TEXT;
BEGIN
  -- Get current year
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(case_number FROM 'CASE-' || year_part || '-(.*)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.cases
  WHERE case_number LIKE 'CASE-' || year_part || '-%';
  
  -- Generate case number: CASE-YYYY-NNNN
  new_case_number := 'CASE-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  NEW.case_number := new_case_number;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "private"."generate_case_number"() OWNER TO "postgres";


COMMENT ON FUNCTION "private"."generate_case_number"() IS 'Auto-generates case numbers in format CASE-YYYY-NNNN';



CREATE OR REPLACE FUNCTION "private"."generate_invoice_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_invoice_number TEXT;
BEGIN
  -- Get current year
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-' || year_part || '-(.*)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-%';
  
  -- Generate invoice number: INV-YYYY-NNNN
  new_invoice_number := 'INV-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  NEW.invoice_number := new_invoice_number;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "private"."generate_invoice_number"() OWNER TO "postgres";


COMMENT ON FUNCTION "private"."generate_invoice_number"() IS 'Auto-generates invoice numbers in format INV-YYYY-NNNN';



CREATE OR REPLACE FUNCTION "private"."get_attorney_profile_id"("user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  profile_id UUID;
BEGIN
  SELECT id INTO profile_id
  FROM public.attorney_profiles
  WHERE user_profile_id = user_id;
  
  RETURN profile_id;
END;
$$;


ALTER FUNCTION "private"."get_attorney_profile_id"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "private"."get_attorney_profile_id"("user_id" "uuid") IS 'Returns attorney_profile_id for a user';



CREATE OR REPLACE FUNCTION "private"."get_client_profile_id"("user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  profile_id UUID;
BEGIN
  SELECT id INTO profile_id
  FROM public.client_profiles
  WHERE user_profile_id = user_id;
  
  RETURN profile_id;
END;
$$;


ALTER FUNCTION "private"."get_client_profile_id"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "private"."get_client_profile_id"("user_id" "uuid") IS 'Returns client_profile_id for a user';



CREATE OR REPLACE FUNCTION "private"."get_user_type"("user_id" "uuid") RETURNS "public"."user_type"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  u_type user_type;
BEGIN
  SELECT user_type INTO u_type
  FROM public.user_profiles
  WHERE id = user_id;
  
  RETURN u_type;
END;
$$;


ALTER FUNCTION "private"."get_user_type"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "private"."get_user_type"("user_id" "uuid") IS 'Returns the user_type for a given user_id';



CREATE OR REPLACE FUNCTION "private"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (SELECT user_type = 'admin' FROM public.user_profiles WHERE id = user_id);
END;
$$;


ALTER FUNCTION "private"."is_admin"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "private"."is_admin"("user_id" "uuid") IS 'Returns true if user is an admin';



CREATE OR REPLACE FUNCTION "private"."is_staff"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT user_type IN ('admin', 'attorney', 'staff')
    FROM public.user_profiles
    WHERE id = user_id
  );
END;
$$;


ALTER FUNCTION "private"."is_staff"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "private"."is_staff"("user_id" "uuid") IS 'Returns true if user is admin, attorney, or staff';



CREATE OR REPLACE FUNCTION "private"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "private"."update_updated_at_column"() OWNER TO "postgres";


COMMENT ON FUNCTION "private"."update_updated_at_column"() IS 'Automatically updates the updated_at timestamp on row update';



CREATE OR REPLACE FUNCTION "public"."generate_complaint_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_year TEXT;
  next_number INT;
BEGIN
  current_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(complaint_number FROM 'CMP-' || current_year || '-(\d+)') AS INT)
  ), 0) + 1
  INTO next_number
  FROM complaints
  WHERE complaint_number LIKE 'CMP-' || current_year || '-%';

  NEW.complaint_number := 'CMP-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_complaint_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_service_registration_reference"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_year TEXT;
  next_number INT;
BEGIN
  current_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM 'SRV-' || current_year || '-(\d+)') AS INT)
  ), 0) + 1
  INTO next_number
  FROM service_registrations
  WHERE reference_number LIKE 'SRV-' || current_year || '-%';

  NEW.reference_number := 'SRV-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_service_registration_reference"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."activity_logs" IS 'Audit trail of all user actions in the system';



COMMENT ON COLUMN "public"."activity_logs"."action" IS 'Action performed (e.g., "create", "update", "delete", "login")';



COMMENT ON COLUMN "public"."activity_logs"."entity_type" IS 'Type of entity affected (e.g., "case", "invoice", "document")';



COMMENT ON COLUMN "public"."activity_logs"."metadata" IS 'Additional context about the action';



CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_profile_id" "uuid" NOT NULL,
    "attorney_profile_id" "uuid" NOT NULL,
    "appointment_date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "duration_minutes" integer NOT NULL,
    "appointment_type" "public"."appointment_type" DEFAULT 'consultation'::"public"."appointment_type" NOT NULL,
    "status" "public"."appointment_status" DEFAULT 'pending'::"public"."appointment_status" NOT NULL,
    "subject" "text" NOT NULL,
    "notes" "text",
    "meeting_link" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "calcom_booking_id" "text",
    "calcom_event_type_id" "text",
    "calcom_booking_uid" "text",
    "google_calendar_event_id" "text",
    "google_calendar_sync_token" "text",
    "reminder_sent_at" timestamp with time zone,
    "reminder_count" integer DEFAULT 0,
    "last_reminder_type" "text",
    "cancellation_reason" "text",
    "cancelled_by" "uuid",
    "cancelled_at" timestamp with time zone,
    "no_show_marked_at" timestamp with time zone,
    "no_show_notes" "text"
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


COMMENT ON TABLE "public"."appointments" IS 'Client-attorney appointment scheduling';



COMMENT ON COLUMN "public"."appointments"."calcom_booking_id" IS 'Cal.com booking ID for webhook reconciliation';



COMMENT ON COLUMN "public"."appointments"."calcom_event_type_id" IS 'Cal.com event type ID';



COMMENT ON COLUMN "public"."appointments"."calcom_booking_uid" IS 'Cal.com booking UID for API calls';



COMMENT ON COLUMN "public"."appointments"."google_calendar_event_id" IS 'Google Calendar event ID for sync';



COMMENT ON COLUMN "public"."appointments"."google_calendar_sync_token" IS 'Sync token for incremental updates';



COMMENT ON COLUMN "public"."appointments"."reminder_sent_at" IS 'Last reminder sent timestamp';



COMMENT ON COLUMN "public"."appointments"."reminder_count" IS 'Number of reminders sent for this appointment';



COMMENT ON COLUMN "public"."appointments"."last_reminder_type" IS 'Type of last reminder (email, sms, whatsapp)';



COMMENT ON COLUMN "public"."appointments"."cancellation_reason" IS 'Reason provided for cancellation';



COMMENT ON COLUMN "public"."appointments"."cancelled_by" IS 'User who cancelled (client or attorney)';



COMMENT ON COLUMN "public"."appointments"."cancelled_at" IS 'Cancellation timestamp';



COMMENT ON COLUMN "public"."appointments"."no_show_marked_at" IS 'When no-show was recorded';



COMMENT ON COLUMN "public"."appointments"."no_show_notes" IS 'Staff notes about no-show circumstances';



CREATE TABLE IF NOT EXISTS "public"."attorney_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_profile_id" "uuid" NOT NULL,
    "bar_number" "text",
    "specializations" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "education" "text",
    "experience_years" integer,
    "hourly_rate" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."attorney_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."attorney_profiles" IS 'Extended profile information for attorney users';



COMMENT ON COLUMN "public"."attorney_profiles"."user_profile_id" IS 'Foreign key to user_profiles.id';



COMMENT ON COLUMN "public"."attorney_profiles"."bar_number" IS 'Bar association registration number';



COMMENT ON COLUMN "public"."attorney_profiles"."specializations" IS 'Array of practice area specializations';



CREATE TABLE IF NOT EXISTS "public"."availability_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "attorney_profile_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_available" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "buffer_time_minutes" integer DEFAULT 15,
    CONSTRAINT "availability_slots_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6))),
    CONSTRAINT "check_end_time_after_start" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."availability_slots" OWNER TO "postgres";


COMMENT ON TABLE "public"."availability_slots" IS 'Attorney availability schedule by day of week';



COMMENT ON COLUMN "public"."availability_slots"."day_of_week" IS 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)';



COMMENT ON COLUMN "public"."availability_slots"."is_available" IS 'Whether the attorney is available during this time slot';



COMMENT ON COLUMN "public"."availability_slots"."buffer_time_minutes" IS 'Buffer time after each appointment (prevents back-to-back bookings)';



CREATE TABLE IF NOT EXISTS "public"."blog_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."blog_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."blog_categories" IS 'Categories for blog posts and legal articles';



CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "excerpt" "text",
    "content" "text" NOT NULL,
    "featured_image" "text",
    "author_id" "uuid" NOT NULL,
    "category_id" "uuid",
    "status" "public"."post_status" DEFAULT 'draft'::"public"."post_status" NOT NULL,
    "published_at" timestamp with time zone,
    "view_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."blog_posts" IS 'Blog posts and legal articles';



COMMENT ON COLUMN "public"."blog_posts"."view_count" IS 'Number of times the post has been viewed';



CREATE TABLE IF NOT EXISTS "public"."case_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "activity_type" "public"."activity_type" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid" NOT NULL,
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."case_activities" OWNER TO "postgres";


COMMENT ON TABLE "public"."case_activities" IS 'Timeline of activities and events for each case';



COMMENT ON COLUMN "public"."case_activities"."attachments" IS 'JSON array of attachment metadata';



CREATE TABLE IF NOT EXISTS "public"."cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_number" "text",
    "client_profile_id" "uuid" NOT NULL,
    "practice_area_id" "uuid" NOT NULL,
    "service_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."case_status" DEFAULT 'pending'::"public"."case_status" NOT NULL,
    "priority" "public"."case_priority" DEFAULT 'medium'::"public"."case_priority" NOT NULL,
    "case_type" "text",
    "filing_date" "date",
    "closing_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assigned_to_id" "uuid"
);


ALTER TABLE "public"."cases" OWNER TO "postgres";


COMMENT ON TABLE "public"."cases" IS 'Legal cases managed by the firm';



COMMENT ON COLUMN "public"."cases"."case_number" IS 'Auto-generated unique case number (format: CASE-YYYY-NNNN)';



CREATE TABLE IF NOT EXISTS "public"."client_interactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_profile_id" "uuid" NOT NULL,
    "staff_user_id" "uuid" NOT NULL,
    "interaction_type" "public"."interaction_type" NOT NULL,
    "subject" "text" NOT NULL,
    "notes" "text",
    "scheduled_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_interactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_interactions" IS 'CRM tracking of client communications and interactions';



COMMENT ON COLUMN "public"."client_interactions"."staff_user_id" IS 'The staff member who handled the interaction';



CREATE TABLE IF NOT EXISTS "public"."client_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_profile_id" "uuid" NOT NULL,
    "company_name" "text",
    "company_type" "text",
    "tax_id" "text",
    "address" "text",
    "city" "text",
    "country" "text" DEFAULT 'Pakistan'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_profiles" IS 'Extended profile information for client users';



COMMENT ON COLUMN "public"."client_profiles"."user_profile_id" IS 'Foreign key to user_profiles.id';



COMMENT ON COLUMN "public"."client_profiles"."company_type" IS 'Type of company (e.g., LLC, Corporation, Partnership)';



CREATE TABLE IF NOT EXISTS "public"."complaints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "complaint_number" "text",
    "client_profile_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "target_organization" "text" NOT NULL,
    "location" "text",
    "category" "text",
    "evidence_urls" "text"[] DEFAULT '{}'::"text"[],
    "status" "public"."complaint_status" DEFAULT 'submitted'::"public"."complaint_status" NOT NULL,
    "assigned_to_id" "uuid",
    "staff_notes" "text",
    "resolution_notes" "text",
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."complaints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "file_path" "text" NOT NULL,
    "file_size" integer,
    "file_type" "text",
    "uploaded_by" "uuid" NOT NULL,
    "case_id" "uuid",
    "client_profile_id" "uuid",
    "document_type" "public"."document_type" DEFAULT 'other'::"public"."document_type" NOT NULL,
    "is_encrypted" boolean DEFAULT false NOT NULL,
    "encryption_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "service_registration_id" "uuid"
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."documents" IS 'Document storage metadata with Supabase Storage paths';



COMMENT ON COLUMN "public"."documents"."file_path" IS 'Path to file in Supabase Storage';



COMMENT ON COLUMN "public"."documents"."is_encrypted" IS 'Whether the document is encrypted at rest';



COMMENT ON COLUMN "public"."documents"."encryption_metadata" IS 'Encryption algorithm and key metadata';



CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invoice_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."invoice_items" IS 'Line items for each invoice';



COMMENT ON COLUMN "public"."invoice_items"."quantity" IS 'Number of units (e.g., hours of work, number of documents)';



COMMENT ON COLUMN "public"."invoice_items"."amount" IS 'Total amount for this line item (quantity * unit_price)';



CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_number" "text",
    "client_profile_id" "uuid" NOT NULL,
    "case_id" "uuid",
    "issue_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "due_date" "date" NOT NULL,
    "subtotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "tax_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "status" "public"."invoice_status" DEFAULT 'draft'::"public"."invoice_status" NOT NULL,
    "payment_terms" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


COMMENT ON TABLE "public"."invoices" IS 'Client invoices for legal services';



COMMENT ON COLUMN "public"."invoices"."invoice_number" IS 'Auto-generated unique invoice number (format: INV-YYYY-NNNN)';



CREATE TABLE IF NOT EXISTS "public"."legal_news" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "source" "text",
    "url" "text",
    "published_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."legal_news" OWNER TO "postgres";


COMMENT ON TABLE "public"."legal_news" IS 'Pakistan legal news from external API for news ticker';



COMMENT ON COLUMN "public"."legal_news"."source" IS 'News source name (e.g., "Dawn", "The Express Tribune")';



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "client_profile_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "payment_method" "public"."payment_method" NOT NULL,
    "safepay_transaction_id" "text",
    "safepay_tracker_id" "text",
    "status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "payment_date" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "failure_reason" "text",
    "failure_code" "text",
    "refund_amount" numeric(10,2),
    "refund_date" timestamp with time zone,
    "refund_reason" "text",
    "payment_link" "text",
    "payment_link_expires_at" timestamp with time zone,
    "currency" character varying(3) DEFAULT 'PKR'::character varying NOT NULL,
    CONSTRAINT "payments_check" CHECK (("refund_amount" <= "amount"))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


COMMENT ON TABLE "public"."payments" IS 'Payment transactions linked to invoices';



COMMENT ON COLUMN "public"."payments"."safepay_transaction_id" IS 'Safepay transaction identifier';



COMMENT ON COLUMN "public"."payments"."safepay_tracker_id" IS 'Safepay tracker identifier for webhook reconciliation';



COMMENT ON COLUMN "public"."payments"."metadata" IS 'Additional payment metadata from Safepay';



COMMENT ON COLUMN "public"."payments"."failure_reason" IS 'Human-readable failure message from Safepay';



COMMENT ON COLUMN "public"."payments"."failure_code" IS 'Safepay error code for programmatic handling';



COMMENT ON COLUMN "public"."payments"."refund_amount" IS 'Amount refunded (supports partial refunds)';



COMMENT ON COLUMN "public"."payments"."refund_date" IS 'Date refund was processed';



COMMENT ON COLUMN "public"."payments"."refund_reason" IS 'Reason for refund (customer service notes)';



COMMENT ON COLUMN "public"."payments"."payment_link" IS 'Safepay payment link URL for email distribution';



COMMENT ON COLUMN "public"."payments"."payment_link_expires_at" IS 'Payment link expiration timestamp';



COMMENT ON COLUMN "public"."payments"."currency" IS 'ISO 4217 currency code (PKR, USD, etc.)';



CREATE TABLE IF NOT EXISTS "public"."practice_areas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."practice_areas" OWNER TO "postgres";


COMMENT ON TABLE "public"."practice_areas" IS 'Law firm practice areas (e.g., Corporate Law, Tax Law, Immigration)';



COMMENT ON COLUMN "public"."practice_areas"."slug" IS 'URL-friendly identifier for routing';



COMMENT ON COLUMN "public"."practice_areas"."icon" IS 'Icon identifier or SVG path';



CREATE TABLE IF NOT EXISTS "public"."service_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reference_number" "text",
    "service_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "cnic" "text",
    "address" "text",
    "description_of_need" "text",
    "payment_status" "public"."service_registration_payment_status" DEFAULT 'pending'::"public"."service_registration_payment_status" NOT NULL,
    "safepay_tracker_id" "text",
    "safepay_transaction_id" "text",
    "status" "public"."service_registration_status" DEFAULT 'pending_payment'::"public"."service_registration_status" NOT NULL,
    "client_profile_id" "uuid",
    "assigned_to_id" "uuid",
    "staff_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."service_registrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "practice_area_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "base_fee" numeric(10,2),
    "estimated_duration" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "registration_fee" numeric(10,2)
);


ALTER TABLE "public"."services" OWNER TO "postgres";


COMMENT ON TABLE "public"."services" IS 'Legal services offered within each practice area';



COMMENT ON COLUMN "public"."services"."practice_area_id" IS 'Foreign key to practice_areas.id';



COMMENT ON COLUMN "public"."services"."base_fee" IS 'Starting fee for the service in PKR';



COMMENT ON COLUMN "public"."services"."estimated_duration" IS 'Expected time to complete (e.g., "2-4 weeks")';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_profile_id" "uuid" NOT NULL,
    "plan_name" "text" DEFAULT 'civic_retainer'::"text" NOT NULL,
    "monthly_amount" numeric(10,2) DEFAULT 700.00 NOT NULL,
    "currency" character varying(3) DEFAULT 'PKR'::character varying NOT NULL,
    "status" "public"."subscription_status" DEFAULT 'pending'::"public"."subscription_status" NOT NULL,
    "safepay_subscription_id" "text",
    "safepay_customer_id" "text",
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "cancellation_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_profile_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "rating" integer NOT NULL,
    "is_approved" boolean DEFAULT false NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "testimonials_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


COMMENT ON TABLE "public"."testimonials" IS 'Client testimonials and reviews';



COMMENT ON COLUMN "public"."testimonials"."rating" IS 'Star rating (1-5)';



COMMENT ON COLUMN "public"."testimonials"."is_approved" IS 'Whether the testimonial has been approved for public display';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone_number" "text",
    "user_type" "public"."user_type" DEFAULT 'client'::"public"."user_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_profiles" IS 'User profile information extending Supabase auth.users';



COMMENT ON COLUMN "public"."user_profiles"."id" IS 'Foreign key to auth.users.id';



COMMENT ON COLUMN "public"."user_profiles"."user_type" IS 'Role: client, attorney, staff, or admin';



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_calcom_booking_id_key" UNIQUE ("calcom_booking_id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attorney_profiles"
    ADD CONSTRAINT "attorney_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."availability_slots"
    ADD CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."case_activities"
    ADD CONSTRAINT "case_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_case_number_key" UNIQUE ("case_number");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_interactions"
    ADD CONSTRAINT "client_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_profiles"
    ADD CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_complaint_number_key" UNIQUE ("complaint_number");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legal_news"
    ADD CONSTRAINT "legal_news_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."practice_areas"
    ADD CONSTRAINT "practice_areas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."practice_areas"
    ADD CONSTRAINT "practice_areas_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."service_registrations"
    ADD CONSTRAINT "service_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_registrations"
    ADD CONSTRAINT "service_registrations_reference_number_key" UNIQUE ("reference_number");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_client_profile_id_key" UNIQUE ("client_profile_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "unique_attorney_time_slot" UNIQUE ("attorney_profile_id", "appointment_date", "start_time");



COMMENT ON CONSTRAINT "unique_attorney_time_slot" ON "public"."appointments" IS 'Prevents double-booking for attorneys';



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_logs_action" ON "public"."activity_logs" USING "btree" ("action");



CREATE INDEX "idx_activity_logs_created_at" ON "public"."activity_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_activity_logs_entity_id" ON "public"."activity_logs" USING "btree" ("entity_id");



CREATE INDEX "idx_activity_logs_entity_type" ON "public"."activity_logs" USING "btree" ("entity_type");



CREATE INDEX "idx_activity_logs_user_id" ON "public"."activity_logs" USING "btree" ("user_id");



CREATE INDEX "idx_appointments_attorney_profile_id" ON "public"."appointments" USING "btree" ("attorney_profile_id");



CREATE INDEX "idx_appointments_calcom_booking_id" ON "public"."appointments" USING "btree" ("calcom_booking_id");



CREATE INDEX "idx_appointments_client_profile_id" ON "public"."appointments" USING "btree" ("client_profile_id");



CREATE INDEX "idx_appointments_date" ON "public"."appointments" USING "btree" ("appointment_date");



CREATE INDEX "idx_appointments_google_calendar_event_id" ON "public"."appointments" USING "btree" ("google_calendar_event_id");



CREATE INDEX "idx_appointments_status" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "idx_attorney_profiles_bar_number" ON "public"."attorney_profiles" USING "btree" ("bar_number");



CREATE UNIQUE INDEX "idx_attorney_profiles_user_profile_id" ON "public"."attorney_profiles" USING "btree" ("user_profile_id");



CREATE INDEX "idx_availability_slots_attorney_profile_id" ON "public"."availability_slots" USING "btree" ("attorney_profile_id");



CREATE INDEX "idx_availability_slots_day_of_week" ON "public"."availability_slots" USING "btree" ("day_of_week");



CREATE INDEX "idx_availability_slots_is_available" ON "public"."availability_slots" USING "btree" ("is_available");



CREATE INDEX "idx_blog_posts_author_id" ON "public"."blog_posts" USING "btree" ("author_id");



CREATE INDEX "idx_blog_posts_category_id" ON "public"."blog_posts" USING "btree" ("category_id");



CREATE INDEX "idx_blog_posts_published_at" ON "public"."blog_posts" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_blog_posts_status" ON "public"."blog_posts" USING "btree" ("status");



CREATE INDEX "idx_case_activities_case_id" ON "public"."case_activities" USING "btree" ("case_id");



CREATE INDEX "idx_case_activities_created_at" ON "public"."case_activities" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_case_activities_type" ON "public"."case_activities" USING "btree" ("activity_type");



CREATE INDEX "idx_cases_client_profile_id" ON "public"."cases" USING "btree" ("client_profile_id");



CREATE INDEX "idx_cases_priority" ON "public"."cases" USING "btree" ("priority");



CREATE INDEX "idx_cases_status" ON "public"."cases" USING "btree" ("status");



CREATE INDEX "idx_client_interactions_client_profile_id" ON "public"."client_interactions" USING "btree" ("client_profile_id");



CREATE INDEX "idx_client_interactions_interaction_type" ON "public"."client_interactions" USING "btree" ("interaction_type");



CREATE INDEX "idx_client_interactions_scheduled_at" ON "public"."client_interactions" USING "btree" ("scheduled_at");



CREATE INDEX "idx_client_interactions_staff_user_id" ON "public"."client_interactions" USING "btree" ("staff_user_id");



CREATE INDEX "idx_client_profiles_city" ON "public"."client_profiles" USING "btree" ("city");



CREATE UNIQUE INDEX "idx_client_profiles_user_profile_id" ON "public"."client_profiles" USING "btree" ("user_profile_id");



CREATE INDEX "idx_documents_case_id" ON "public"."documents" USING "btree" ("case_id");



CREATE INDEX "idx_documents_client_profile_id" ON "public"."documents" USING "btree" ("client_profile_id");



CREATE INDEX "idx_documents_created_at" ON "public"."documents" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_documents_document_type" ON "public"."documents" USING "btree" ("document_type");



CREATE INDEX "idx_documents_uploaded_by" ON "public"."documents" USING "btree" ("uploaded_by");



CREATE INDEX "idx_invoice_items_invoice_id" ON "public"."invoice_items" USING "btree" ("invoice_id");



CREATE INDEX "idx_invoices_case_id" ON "public"."invoices" USING "btree" ("case_id");



CREATE INDEX "idx_invoices_client_profile_id" ON "public"."invoices" USING "btree" ("client_profile_id");



CREATE INDEX "idx_invoices_due_date" ON "public"."invoices" USING "btree" ("due_date");



CREATE INDEX "idx_invoices_status" ON "public"."invoices" USING "btree" ("status");



CREATE INDEX "idx_legal_news_created_at" ON "public"."legal_news" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_legal_news_published_at" ON "public"."legal_news" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_payments_client_profile_id" ON "public"."payments" USING "btree" ("client_profile_id");



CREATE INDEX "idx_payments_invoice_id" ON "public"."payments" USING "btree" ("invoice_id");



CREATE INDEX "idx_payments_safepay_transaction_id" ON "public"."payments" USING "btree" ("safepay_transaction_id");



CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "idx_practice_areas_is_active" ON "public"."practice_areas" USING "btree" ("is_active");



CREATE INDEX "idx_services_is_active" ON "public"."services" USING "btree" ("is_active");



CREATE INDEX "idx_services_practice_area_id" ON "public"."services" USING "btree" ("practice_area_id");



CREATE UNIQUE INDEX "idx_services_practice_area_slug" ON "public"."services" USING "btree" ("practice_area_id", "slug");



CREATE INDEX "idx_testimonials_client_profile_id" ON "public"."testimonials" USING "btree" ("client_profile_id");



CREATE INDEX "idx_testimonials_is_approved" ON "public"."testimonials" USING "btree" ("is_approved");



CREATE INDEX "idx_testimonials_rating" ON "public"."testimonials" USING "btree" ("rating" DESC);



CREATE INDEX "idx_user_profiles_user_type" ON "public"."user_profiles" USING "btree" ("user_type");



CREATE OR REPLACE TRIGGER "set_complaint_number" BEFORE INSERT ON "public"."complaints" FOR EACH ROW WHEN (("new"."complaint_number" IS NULL)) EXECUTE FUNCTION "public"."generate_complaint_number"();



CREATE OR REPLACE TRIGGER "set_service_registration_reference" BEFORE INSERT ON "public"."service_registrations" FOR EACH ROW WHEN (("new"."reference_number" IS NULL)) EXECUTE FUNCTION "public"."generate_service_registration_reference"();



CREATE OR REPLACE TRIGGER "trigger_generate_case_number" BEFORE INSERT ON "public"."cases" FOR EACH ROW WHEN (("new"."case_number" IS NULL)) EXECUTE FUNCTION "private"."generate_case_number"();



CREATE OR REPLACE TRIGGER "trigger_generate_invoice_number" BEFORE INSERT ON "public"."invoices" FOR EACH ROW WHEN (("new"."invoice_number" IS NULL)) EXECUTE FUNCTION "private"."generate_invoice_number"();



CREATE OR REPLACE TRIGGER "trigger_update_appointments_updated_at" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_attorney_profiles_updated_at" BEFORE UPDATE ON "public"."attorney_profiles" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_availability_slots_updated_at" BEFORE UPDATE ON "public"."availability_slots" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_blog_categories_updated_at" BEFORE UPDATE ON "public"."blog_categories" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_blog_posts_updated_at" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_cases_updated_at" BEFORE UPDATE ON "public"."cases" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_client_interactions_updated_at" BEFORE UPDATE ON "public"."client_interactions" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_client_profiles_updated_at" BEFORE UPDATE ON "public"."client_profiles" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_documents_updated_at" BEFORE UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_invoices_updated_at" BEFORE UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_practice_areas_updated_at" BEFORE UPDATE ON "public"."practice_areas" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_services_updated_at" BEFORE UPDATE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_testimonials_updated_at" BEFORE UPDATE ON "public"."testimonials" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_complaints_updated_at" BEFORE UPDATE ON "public"."complaints" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_service_registrations_updated_at" BEFORE UPDATE ON "public"."service_registrations" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "private"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_attorney_profile_id_fkey" FOREIGN KEY ("attorney_profile_id") REFERENCES "public"."attorney_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attorney_profiles"
    ADD CONSTRAINT "attorney_profiles_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."availability_slots"
    ADD CONSTRAINT "availability_slots_attorney_profile_id_fkey" FOREIGN KEY ("attorney_profile_id") REFERENCES "public"."attorney_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."case_activities"
    ADD CONSTRAINT "case_activities_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_activities"
    ADD CONSTRAINT "case_activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_practice_area_id_fkey" FOREIGN KEY ("practice_area_id") REFERENCES "public"."practice_areas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_interactions"
    ADD CONSTRAINT "client_interactions_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_interactions"
    ADD CONSTRAINT "client_interactions_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_profiles"
    ADD CONSTRAINT "client_profiles_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_service_registration_id_fkey" FOREIGN KEY ("service_registration_id") REFERENCES "public"."service_registrations"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_registrations"
    ADD CONSTRAINT "service_registrations_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."service_registrations"
    ADD CONSTRAINT "service_registrations_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id");



ALTER TABLE ONLY "public"."service_registrations"
    ADD CONSTRAINT "service_registrations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_practice_area_id_fkey" FOREIGN KEY ("practice_area_id") REFERENCES "public"."practice_areas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "public"."client_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attorney_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."availability_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_interactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complaints" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_attorney_profiles" ON "public"."attorney_profiles" FOR DELETE USING ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_availability_slots" ON "public"."availability_slots" FOR DELETE USING ((("attorney_profile_id" = "private"."get_attorney_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_admin"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "delete_blog_categories" ON "public"."blog_categories" FOR DELETE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_blog_posts" ON "public"."blog_posts" FOR DELETE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_cases" ON "public"."cases" FOR DELETE USING ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_client_interactions" ON "public"."client_interactions" FOR DELETE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_client_profiles" ON "public"."client_profiles" FOR DELETE USING ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_documents" ON "public"."documents" FOR DELETE USING ((("uploaded_by" = ( SELECT "auth"."uid"() AS "uid")) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "delete_invoice_items" ON "public"."invoice_items" FOR DELETE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_invoices" ON "public"."invoices" FOR DELETE USING ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_legal_news" ON "public"."legal_news" FOR DELETE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_payments" ON "public"."payments" FOR DELETE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_practice_areas" ON "public"."practice_areas" FOR DELETE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_services" ON "public"."services" FOR DELETE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "delete_user_profiles" ON "public"."user_profiles" FOR DELETE USING ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_activity_logs" ON "public"."activity_logs" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") IS NOT NULL));



CREATE POLICY "insert_appointments" ON "public"."appointments" FOR INSERT WITH CHECK ((("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "insert_attorney_profiles" ON "public"."attorney_profiles" FOR INSERT WITH CHECK ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_availability_slots" ON "public"."availability_slots" FOR INSERT WITH CHECK ((("attorney_profile_id" = "private"."get_attorney_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_admin"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "insert_blog_categories" ON "public"."blog_categories" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_blog_posts" ON "public"."blog_posts" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_case_activities" ON "public"."case_activities" FOR INSERT WITH CHECK (("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")) AND ("created_by" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "insert_cases" ON "public"."cases" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_client_interactions" ON "public"."client_interactions" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_client_profiles" ON "public"."client_profiles" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_complaints" ON "public"."complaints" FOR INSERT WITH CHECK (("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "insert_documents" ON "public"."documents" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND ("uploaded_by" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "insert_invoice_items" ON "public"."invoice_items" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_invoices" ON "public"."invoices" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_legal_news" ON "public"."legal_news" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_payments" ON "public"."payments" FOR INSERT WITH CHECK ((("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "insert_practice_areas" ON "public"."practice_areas" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_service_registrations" ON "public"."service_registrations" FOR INSERT WITH CHECK (true);



CREATE POLICY "insert_services" ON "public"."services" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_subscriptions" ON "public"."subscriptions" FOR INSERT WITH CHECK ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "insert_testimonials" ON "public"."testimonials" FOR INSERT WITH CHECK (("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "insert_user_profiles" ON "public"."user_profiles" FOR INSERT WITH CHECK ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."legal_news" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."practice_areas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_activity_logs" ON "public"."activity_logs" FOR SELECT USING ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "select_appointments" ON "public"."appointments" FOR SELECT USING ((("attorney_profile_id" = "private"."get_attorney_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR ("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_attorney_profiles" ON "public"."attorney_profiles" FOR SELECT USING (true);



CREATE POLICY "select_availability_slots" ON "public"."availability_slots" FOR SELECT USING ((("is_available" = true) OR ("attorney_profile_id" = "private"."get_attorney_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_admin"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_blog_categories" ON "public"."blog_categories" FOR SELECT USING (true);



CREATE POLICY "select_blog_posts" ON "public"."blog_posts" FOR SELECT USING ((("status" = 'published'::"public"."post_status") OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_case_activities" ON "public"."case_activities" FOR SELECT USING ((("case_id" IN ( SELECT "cases"."id"
   FROM "public"."cases"
  WHERE ("cases"."assigned_to_id" = ( SELECT "auth"."uid"() AS "uid")))) OR ("case_id" IN ( SELECT "cases"."id"
   FROM "public"."cases"
  WHERE ("cases"."client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_cases" ON "public"."cases" FOR SELECT USING ((("assigned_to_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_client_interactions" ON "public"."client_interactions" FOR SELECT USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "select_client_profiles" ON "public"."client_profiles" FOR SELECT USING ((("user_profile_id" = ( SELECT "auth"."uid"() AS "uid")) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_complaints" ON "public"."complaints" FOR SELECT USING ((("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_documents" ON "public"."documents" FOR SELECT USING ((("case_id" IN ( SELECT "cases"."id"
   FROM "public"."cases"
  WHERE ("cases"."assigned_to_id" = ( SELECT "auth"."uid"() AS "uid")))) OR ("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR ("case_id" IN ( SELECT "cases"."id"
   FROM "public"."cases"
  WHERE ("cases"."client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_invoice_items" ON "public"."invoice_items" FOR SELECT USING ((("invoice_id" IN ( SELECT "invoices"."id"
   FROM "public"."invoices"
  WHERE ("invoices"."client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_invoices" ON "public"."invoices" FOR SELECT USING ((("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_legal_news" ON "public"."legal_news" FOR SELECT USING (true);



CREATE POLICY "select_payments" ON "public"."payments" FOR SELECT USING ((("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_practice_areas" ON "public"."practice_areas" FOR SELECT USING ((("is_active" = true) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_service_registrations" ON "public"."service_registrations" FOR SELECT USING (true);



CREATE POLICY "select_services" ON "public"."services" FOR SELECT USING ((("is_active" = true) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_subscriptions" ON "public"."subscriptions" FOR SELECT USING ((("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_testimonials" ON "public"."testimonials" FOR SELECT USING ((("is_approved" = true) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "select_user_profiles" ON "public"."user_profiles" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "id") OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."service_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_appointments" ON "public"."appointments" FOR UPDATE USING (((("client_profile_id" = "private"."get_client_profile_id"(( SELECT "auth"."uid"() AS "uid"))) AND ("status" <> 'completed'::"public"."appointment_status")) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "update_attorney_profiles" ON "public"."attorney_profiles" FOR UPDATE USING ((("user_profile_id" = ( SELECT "auth"."uid"() AS "uid")) OR "private"."is_admin"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "update_availability_slots" ON "public"."availability_slots" FOR UPDATE USING ((("attorney_profile_id" = "private"."get_attorney_profile_id"(( SELECT "auth"."uid"() AS "uid"))) OR "private"."is_admin"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "update_blog_categories" ON "public"."blog_categories" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_blog_posts" ON "public"."blog_posts" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_cases" ON "public"."cases" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_client_interactions" ON "public"."client_interactions" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_client_profiles" ON "public"."client_profiles" FOR UPDATE USING ((("user_profile_id" = ( SELECT "auth"."uid"() AS "uid")) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "update_complaints" ON "public"."complaints" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_documents" ON "public"."documents" FOR UPDATE USING ((("uploaded_by" = ( SELECT "auth"."uid"() AS "uid")) OR "private"."is_staff"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "update_invoice_items" ON "public"."invoice_items" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_invoices" ON "public"."invoices" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_legal_news" ON "public"."legal_news" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_payments" ON "public"."payments" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_practice_areas" ON "public"."practice_areas" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_service_registrations" ON "public"."service_registrations" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_services" ON "public"."services" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_subscriptions" ON "public"."subscriptions" FOR UPDATE USING ("private"."is_staff"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_testimonials" ON "public"."testimonials" FOR UPDATE USING ("private"."is_admin"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "update_user_profiles" ON "public"."user_profiles" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "id") OR "private"."is_admin"(( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."generate_complaint_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_complaint_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_complaint_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_service_registration_reference"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_service_registration_reference"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_service_registration_reference"() TO "service_role";


















GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."attorney_profiles" TO "anon";
GRANT ALL ON TABLE "public"."attorney_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."attorney_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."availability_slots" TO "anon";
GRANT ALL ON TABLE "public"."availability_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_slots" TO "service_role";



GRANT ALL ON TABLE "public"."blog_categories" TO "anon";
GRANT ALL ON TABLE "public"."blog_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_categories" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."case_activities" TO "anon";
GRANT ALL ON TABLE "public"."case_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."case_activities" TO "service_role";



GRANT ALL ON TABLE "public"."cases" TO "anon";
GRANT ALL ON TABLE "public"."cases" TO "authenticated";
GRANT ALL ON TABLE "public"."cases" TO "service_role";



GRANT ALL ON TABLE "public"."client_interactions" TO "anon";
GRANT ALL ON TABLE "public"."client_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."client_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."client_profiles" TO "anon";
GRANT ALL ON TABLE "public"."client_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."client_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."complaints" TO "anon";
GRANT ALL ON TABLE "public"."complaints" TO "authenticated";
GRANT ALL ON TABLE "public"."complaints" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_items" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."legal_news" TO "anon";
GRANT ALL ON TABLE "public"."legal_news" TO "authenticated";
GRANT ALL ON TABLE "public"."legal_news" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."practice_areas" TO "anon";
GRANT ALL ON TABLE "public"."practice_areas" TO "authenticated";
GRANT ALL ON TABLE "public"."practice_areas" TO "service_role";



GRANT ALL ON TABLE "public"."service_registrations" TO "anon";
GRANT ALL ON TABLE "public"."service_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."service_registrations" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials" TO "anon";
GRANT ALL ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


