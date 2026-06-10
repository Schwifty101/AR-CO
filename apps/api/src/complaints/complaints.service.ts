import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { PaymentProofService } from '../payments/payment-proof.service';
import { PaymentEmailService } from '../payments/payment-email.service';
import { MailerService } from '../payments/mailer.service';
import { STAFF_ROLES } from '../common/constants/roles';
import {
  validateSortColumn,
  sanitizePostgrestFilter,
} from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  ComplaintStatus,
  ComplaintPaymentStatus,
  type CreateComplaintData,
  type ComplaintStatusCheckData,
  type UpdateComplaintStatusData,
  type AssignToData,
  type ReviewPaymentData,
  type ComplaintFilters,
  type ComplaintResponse,
  type ComplaintStatusResponse,
  type PaginatedComplaintsResponse,
  type PaginationParams,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Flat complaint filing fee in PKR (manual payment) */
export const COMPLAINT_FEE_PKR = 1000;

/** Database row shape for the complaints table with joined assigned user profile */
interface ComplaintRow {
  id: string;
  complaint_number: string;
  client_profile_id: string | null;
  title: string;
  description: string;
  target_organization: string;
  location: string | null;
  category: string | null;
  evidence_urls: string[];
  status: ComplaintStatus;
  assigned_to_id: string | null;
  staff_notes: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  // Guest contact
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  // Structured intake
  cnic: string | null;
  city: string | null;
  address: string | null;
  department: string | null;
  institution_reference: string | null;
  issue_type: string | null;
  incident_date: string | null;
  desired_outcome: string | null;
  prior_attempts: boolean | null;
  prior_attempt_reference: string | null;
  // Payment (manual screenshot flow)
  payment_status: ComplaintPaymentStatus;
  payment_proof_path: string | null;
  payment_review_note: string | null;
  payment_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  /** Joined assigned user profile from user_profiles via assigned_to_id */
  assigned_to: { full_name: string } | null;
}

/**
 * Supabase select clause that joins assigned user profile
 * Uses a foreign-key relationship: complaints.assigned_to_id -> user_profiles.id
 */
const COMPLAINT_SELECT_WITH_ASSIGNED =
  '*, assigned_to:user_profiles!complaints_assigned_to_id_fkey(full_name)' as const;

/** Allowed sort columns for complaints */
const ALLOWED_COMPLAINT_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'complaint_number',
  'status',
] as const;

/**
 * Service responsible for managing citizen complaints lifecycle
 * Handles guest submission, manual payment review, tracking, assignment, and
 * resolution of complaints.
 *
 * @remarks
 * The public complaint flow is unauthenticated (guest): a complaint is created,
 * a payment screenshot is uploaded, and an admin confirms/flags the payment —
 * mirroring the service-registration manual-payment flow. Complaints are linked
 * to a client account by email when the user logs in (claim).
 *
 * @example
 * ```typescript
 * const complaint = await complaintsService.submitComplaint({
 *   title: 'Unlawful tax assessment',
 *   description: 'Detailed account of the incident…',
 *   targetOrganization: 'FBR',
 *   fullName: 'Sara Ahmed',
 *   email: 'sara@example.com',
 *   phoneNumber: '+923001234567',
 *   declarationTruthful: true,
 *   declarationTerms: true,
 * });
 * ```
 */
@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly paymentProofService: PaymentProofService,
    private readonly paymentEmailService: PaymentEmailService,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Submits a new complaint (guest/unauthenticated access).
   *
   * @param dto - The complaint creation data (contact + structured intake)
   * @returns The created complaint with auto-generated complaint number
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * const result = await service.submitComplaint({
   *   title: 'Water Supply Issue',
   *   description: 'No water for 3 days in our area',
   *   targetOrganization: 'Water & Sanitation Authority',
   *   fullName: 'Sara Ahmed',
   *   email: 'sara@example.com',
   *   phoneNumber: '+923001234567',
   *   declarationTruthful: true,
   *   declarationTerms: true,
   * });
   * ```
   */
  async submitComplaint(dto: CreateComplaintData): Promise<ComplaintResponse> {
    this.logger.log(`Guest submitting complaint for ${dto.email}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('complaints')
      .insert({
        title: dto.title,
        description: dto.description,
        target_organization: dto.targetOrganization,
        location: dto.location ?? null,
        category: dto.category ?? null,
        evidence_urls: dto.evidenceUrls ?? [],
        full_name: dto.fullName,
        email: dto.email,
        phone_number: dto.phoneNumber,
        cnic: dto.cnic ?? null,
        city: dto.city ?? null,
        address: dto.address ?? null,
        department: dto.department ?? null,
        institution_reference: dto.institutionReference ?? null,
        issue_type: dto.issueType ?? null,
        incident_date: dto.incidentDate ?? null,
        desired_outcome: dto.desiredOutcome ?? null,
        prior_attempts: dto.priorAttempts ?? null,
        prior_attempt_reference: dto.priorAttemptReference ?? null,
        declaration_truthful: dto.declarationTruthful,
        declaration_terms: dto.declarationTerms,
      })
      .select(COMPLAINT_SELECT_WITH_ASSIGNED)
      .single()) as DbResult<ComplaintRow>;

    if (error || !data) {
      this.logger.error(`Failed to submit complaint for ${dto.email}`, error);
      throw new InternalServerErrorException('Failed to submit complaint');
    }

    this.logger.log(
      `Complaint ${data.complaint_number} submitted successfully`,
    );

    // Notify the firm mailbox of the new complaint (best-effort)
    await this.mailerService.sendToAdmin(
      `New complaint filed: ${data.complaint_number} — ${data.target_organization}`,
      `
        <h2>New Complaint Filed</h2>
        <p><strong>Complaint #:</strong> ${data.complaint_number}</p>
        <p><strong>Subject:</strong> ${data.title}</p>
        <p><strong>Against:</strong> ${data.target_organization}</p>
        ${data.issue_type ? `<p><strong>Issue Type:</strong> ${data.issue_type}</p>` : ''}
        <p><strong>Name:</strong> ${data.full_name ?? 'N/A'}</p>
        <p><strong>Email:</strong> ${data.email ?? 'N/A'}</p>
        <p><strong>Phone:</strong> ${data.phone_number ?? 'N/A'}</p>
        <p>Awaiting payment of PKR ${COMPLAINT_FEE_PKR.toLocaleString()}. Review it in the admin panel.</p>
      `,
      data.email ?? undefined,
    );

    return this.mapComplaintRow(data);
  }

  /**
   * Retrieves minimal status for a guest user (requires complaint number + email).
   *
   * @param dto - Guest status check data (complaint number + email)
   * @returns Minimal complaint status (no sensitive info)
   * @throws {NotFoundException} If not found or email mismatch
   */
  async getComplaintStatus(
    dto: ComplaintStatusCheckData,
  ): Promise<ComplaintStatusResponse> {
    this.logger.log(`Guest checking status for ${dto.complaintNumber}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('complaints')
      .select('complaint_number, status, payment_status, created_at')
      .eq('complaint_number', dto.complaintNumber)
      .eq('email', dto.email)
      .single()) as DbResult<{
      complaint_number: string;
      status: ComplaintStatus;
      payment_status: ComplaintPaymentStatus;
      created_at: string;
    }>;

    if (error || !data) {
      this.logger.warn(
        `Complaint ${dto.complaintNumber} not found or email mismatch`,
      );
      throw new NotFoundException('Complaint not found');
    }

    return {
      complaintNumber: data.complaint_number,
      status: data.status,
      paymentStatus: data.payment_status,
      createdAt: data.created_at,
    };
  }

  /**
   * Claims all guest complaints matching the authenticated user's email.
   * Called silently on every login. Idempotent — already-linked complaints
   * are skipped. Best-effort: never throws.
   *
   * @param user - The authenticated user
   * @returns Number of complaints claimed
   */
  async claimComplaints(user: AuthUser): Promise<{ claimed: number }> {
    this.logger.log(`Claiming guest complaints for user ${user.id}`);

    if (!user.email || !user.clientProfileId) {
      return { claimed: 0 };
    }

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient
      .from('complaints')
      .update({ client_profile_id: user.clientProfileId })
      .eq('email', user.email)
      .is('client_profile_id', null)
      .select('id');

    if (error) {
      this.logger.error(
        `Failed to claim complaints for user ${user.id}`,
        error,
      );
      return { claimed: 0 };
    }

    const claimed = data?.length ?? 0;
    if (claimed > 0) {
      this.logger.log(
        `Claimed ${claimed} guest complaint(s) for user ${user.id}`,
      );
    }
    return { claimed };
  }

  /**
   * Retrieves complaints with pagination and filtering
   * Clients see only their own (email-claimed) complaints, staff see all.
   *
   * @param user - The authenticated user
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @param filters - Optional filters (status, targetOrganization, category, paymentStatus)
   * @returns Paginated list of complaints with total count
   * @throws {InternalServerErrorException} If database operation fails
   */
  async getComplaints(
    user: AuthUser,
    pagination: PaginationParams,
    filters: ComplaintFilters,
  ): Promise<PaginatedComplaintsResponse> {
    this.logger.log(`Fetching complaints for user ${user.id}`);

    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit, sort, order } = pagination;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('complaints')
      .select(COMPLAINT_SELECT_WITH_ASSIGNED, { count: 'exact' });

    // If user is CLIENT, claim email-matched guest complaints then scope to them
    if (!STAFF_ROLES.includes(user.userType)) {
      if (!user.clientProfileId) {
        throw new BadRequestException('Client profile not found');
      }
      // Self-heal: link the client's email-matched guest complaints to their
      // profile before listing (a complaint stays unlinked until login/claim).
      await this.claimComplaints(user);
      query = query.eq('client_profile_id', user.clientProfileId);
    }

    // Apply optional filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    if (filters.targetOrganization) {
      const sanitized = sanitizePostgrestFilter(filters.targetOrganization);
      query = query.ilike('target_organization', `%${sanitized}%`);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Validate and apply pagination and sorting
    const validSort = validateSortColumn(sort, ALLOWED_COMPLAINT_SORT_COLUMNS);
    query = query
      .order(validSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = (await query) as DbListResult<ComplaintRow>;

    if (error) {
      this.logger.error(
        `Failed to fetch complaints for user ${user.id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch complaints');
    }

    const complaints = (data ?? []).map((row) => this.mapComplaintRow(row));

    return {
      data: complaints,
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Retrieves a single complaint by ID
   * Clients can only view their own complaints, staff can view all
   *
   * @param complaintId - The complaint ID
   * @param user - The authenticated user
   * @returns The complaint details
   * @throws {NotFoundException} If complaint does not exist
   * @throws {ForbiddenException} If client tries to access another client's complaint
   */
  async getComplaintById(
    complaintId: string,
    user: AuthUser,
  ): Promise<ComplaintResponse> {
    this.logger.log(`Fetching complaint ${complaintId} for user ${user.id}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('complaints')
      .select(COMPLAINT_SELECT_WITH_ASSIGNED)
      .eq('id', complaintId)
      .single()) as DbResult<ComplaintRow>;

    if (error || !data) {
      this.logger.warn(`Complaint ${complaintId} not found`);
      throw new NotFoundException('Complaint not found');
    }

    const complaint = this.mapComplaintRow(data);

    // If user is CLIENT, verify they own this complaint
    if (!STAFF_ROLES.includes(user.userType)) {
      if (complaint.clientProfileId !== user.clientProfileId) {
        this.logger.warn(
          `Client ${user.clientProfileId} attempted to access complaint ${complaintId}`,
        );
        throw new ForbiddenException('Access denied to this complaint');
      }
    }

    return complaint;
  }

  /**
   * Uploads a manual payment screenshot for a complaint (guest/public).
   *
   * Stores the screenshot in the private `payment-proofs` bucket and advances
   * the complaint to `awaiting_confirmation` for admin review. Re-upload is
   * allowed while payment is not yet confirmed.
   *
   * @param complaintId - The complaint UUID
   * @param file - Uploaded screenshot (jpg/png/webp/pdf)
   * @returns Updated complaint
   * @throws {NotFoundException} If the complaint does not exist
   * @throws {BadRequestException} If payment already confirmed
   */
  async uploadPaymentProof(
    complaintId: string,
    file: Express.Multer.File,
  ): Promise<ComplaintResponse> {
    this.logger.log(`Uploading payment proof for complaint ${complaintId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data: complaint, error } = (await adminClient
      .from('complaints')
      .select('id, payment_status')
      .eq('id', complaintId)
      .single()) as DbResult<{
      id: string;
      payment_status: ComplaintPaymentStatus;
    }>;

    if (error || !complaint) {
      throw new NotFoundException('Complaint not found');
    }
    if (complaint.payment_status === ComplaintPaymentStatus.PAID) {
      throw new BadRequestException('Payment already confirmed');
    }

    const { storagePath } = await this.paymentProofService.uploadProof(
      `complaints/${complaintId}`,
      file,
    );

    const { data: updated, error: updateError } = (await adminClient
      .from('complaints')
      .update({
        payment_proof_path: storagePath,
        payment_status: ComplaintPaymentStatus.AWAITING_CONFIRMATION,
      })
      .eq('id', complaintId)
      .select(COMPLAINT_SELECT_WITH_ASSIGNED)
      .single()) as DbResult<ComplaintRow>;

    if (updateError || !updated) {
      this.logger.error('Failed to record payment proof', updateError);
      throw new BadRequestException('Failed to record payment proof');
    }

    this.logger.log(`Payment proof recorded for complaint ${complaintId}`);
    return this.mapComplaintRow(updated);
  }

  /**
   * Generates a short-lived signed URL for an admin to view the payment proof.
   *
   * @param complaintId - The complaint UUID
   * @returns `{ url }` — signed URL valid for 1 hour
   * @throws {NotFoundException} If complaint or proof not found
   */
  async getPaymentProofUrl(complaintId: string): Promise<{ url: string }> {
    const adminClient = this.supabaseService.getAdminClient();
    const { data: complaint, error } = (await adminClient
      .from('complaints')
      .select('payment_proof_path')
      .eq('id', complaintId)
      .single()) as DbResult<{ payment_proof_path: string | null }>;

    if (error || !complaint) {
      throw new NotFoundException('Complaint not found');
    }
    if (!complaint.payment_proof_path) {
      throw new NotFoundException(
        'No payment proof uploaded for this complaint',
      );
    }

    const url = await this.paymentProofService.getSignedProofUrl(
      complaint.payment_proof_path,
    );
    return { url };
  }

  /**
   * Reviews a manually-uploaded complaint payment (admin action): confirm or flag.
   *
   * - `confirm`: marks the complaint paid, records who/when, and emails the
   *   client. Idempotent — a no-op if already paid. Does NOT touch the complaint
   *   `status` lifecycle.
   * - `flag`: marks payment `flagged`, stores the admin note, and emails the client.
   *
   * @param complaintId - The complaint UUID
   * @param admin - Authenticated admin/staff user
   * @param dto - Review action + optional note
   * @returns Updated complaint
   * @throws {NotFoundException} If the complaint does not exist
   */
  async reviewPayment(
    complaintId: string,
    admin: AuthUser,
    dto: ReviewPaymentData,
  ): Promise<ComplaintResponse> {
    this.logger.log(
      `Admin ${admin.id} reviewing payment for complaint ${complaintId} (${dto.action})`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const { data: complaint, error } = (await adminClient
      .from('complaints')
      .select('id, payment_status, complaint_number, full_name, email')
      .eq('id', complaintId)
      .single()) as DbResult<{
      id: string;
      payment_status: ComplaintPaymentStatus;
      complaint_number: string;
      full_name: string | null;
      email: string | null;
    }>;

    if (error || !complaint) {
      throw new NotFoundException('Complaint not found');
    }

    // Idempotent confirm: already paid → return as-is.
    if (
      dto.action === 'confirm' &&
      complaint.payment_status === ComplaintPaymentStatus.PAID
    ) {
      this.logger.log(
        `Complaint ${complaintId} already paid — confirm is a no-op`,
      );
      return this.getComplaintRowMapped(complaintId);
    }

    if (dto.action === 'confirm') {
      const { data: updated, error: updateError } = (await adminClient
        .from('complaints')
        .update({
          payment_status: ComplaintPaymentStatus.PAID,
          payment_confirmed_by: admin.id,
          payment_confirmed_at: new Date().toISOString(),
          payment_review_note: dto.note ?? null,
        })
        .eq('id', complaintId)
        .select(COMPLAINT_SELECT_WITH_ASSIGNED)
        .single()) as DbResult<ComplaintRow>;

      if (updateError || !updated) {
        throw new BadRequestException('Failed to confirm payment');
      }

      if (updated.email) {
        await this.paymentEmailService.send('confirmed', {
          to: updated.email,
          fullName: updated.full_name ?? 'Client',
          referenceNumber: updated.complaint_number,
          subject: 'Complaint',
        });
      }

      this.logger.log(
        `Complaint ${complaintId} payment confirmed by admin ${admin.id}`,
      );
      return this.mapComplaintRow(updated);
    }

    // action === 'flag'
    const { data: flagged, error: flagError } = (await adminClient
      .from('complaints')
      .update({
        payment_status: ComplaintPaymentStatus.FLAGGED,
        payment_review_note: dto.note ?? null,
      })
      .eq('id', complaintId)
      .select(COMPLAINT_SELECT_WITH_ASSIGNED)
      .single()) as DbResult<ComplaintRow>;

    if (flagError || !flagged) {
      throw new BadRequestException('Failed to flag payment');
    }

    if (flagged.email) {
      await this.paymentEmailService.send('flagged', {
        to: flagged.email,
        fullName: flagged.full_name ?? 'Client',
        referenceNumber: flagged.complaint_number,
        subject: 'Complaint',
        note: dto.note,
      });
    }

    this.logger.log(
      `Complaint ${complaintId} payment flagged by admin ${admin.id}`,
    );
    return this.mapComplaintRow(flagged);
  }

  /**
   * Updates the status of a complaint (staff only)
   * Automatically sets resolved_at timestamp when status is RESOLVED
   *
   * @param complaintId - The complaint ID
   * @param dto - The status update data (status, staffNotes, resolutionNotes)
   * @returns The updated complaint
   * @throws {NotFoundException} If complaint does not exist
   */
  async updateComplaintStatus(
    complaintId: string,
    dto: UpdateComplaintStatusData,
  ): Promise<ComplaintResponse> {
    this.logger.log(
      `Updating status for complaint ${complaintId} to ${dto.status}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const updateData: Record<string, unknown> = {
      status: dto.status,
    };

    if (dto.staffNotes !== undefined) {
      updateData.staff_notes = dto.staffNotes;
    }

    if (dto.resolutionNotes !== undefined) {
      updateData.resolution_notes = dto.resolutionNotes;
    }

    // If status is RESOLVED, set resolved_at timestamp
    if (dto.status === ComplaintStatus.RESOLVED) {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = (await adminClient
      .from('complaints')
      .update(updateData)
      .eq('id', complaintId)
      .select(COMPLAINT_SELECT_WITH_ASSIGNED)
      .single()) as DbResult<ComplaintRow>;

    if (error || !data) {
      this.logger.error(`Failed to update complaint ${complaintId}`, error);
      throw new NotFoundException('Complaint not found');
    }

    this.logger.log(`Complaint ${complaintId} status updated successfully`);
    return this.mapComplaintRow(data);
  }

  /**
   * Assigns a complaint to a user (staff/attorney) (staff only)
   * Automatically updates status to UNDER_REVIEW if currently SUBMITTED
   *
   * @param complaintId - The complaint ID
   * @param dto - The assignment data (assignedToId)
   * @returns The updated complaint
   * @throws {NotFoundException} If complaint does not exist
   */
  async assignComplaint(
    complaintId: string,
    dto: AssignToData,
  ): Promise<ComplaintResponse> {
    this.logger.log(
      `Assigning complaint ${complaintId} to user ${dto.assignedToId}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    // First fetch the complaint to check current status
    const { data: currentComplaint, error: fetchError } = (await adminClient
      .from('complaints')
      .select('status')
      .eq('id', complaintId)
      .single()) as DbResult<{ status: ComplaintStatus }>;

    if (fetchError || !currentComplaint) {
      this.logger.error(`Failed to fetch complaint ${complaintId}`, fetchError);
      throw new NotFoundException('Complaint not found');
    }

    const updateData: Record<string, unknown> = {
      assigned_to_id: dto.assignedToId,
    };

    // If complaint status is 'submitted', also update to 'under_review'
    if (currentComplaint.status === ComplaintStatus.SUBMITTED) {
      updateData.status = ComplaintStatus.UNDER_REVIEW;
    }

    const { data, error } = (await adminClient
      .from('complaints')
      .update(updateData)
      .eq('id', complaintId)
      .select(COMPLAINT_SELECT_WITH_ASSIGNED)
      .single()) as DbResult<ComplaintRow>;

    if (error || !data) {
      this.logger.error(`Failed to assign complaint ${complaintId}`, error);
      throw new InternalServerErrorException('Failed to assign complaint');
    }

    this.logger.log(`Complaint ${complaintId} assigned successfully`);
    return this.mapComplaintRow(data);
  }

  /**
   * Fetches a complaint by ID and maps it (used by idempotent paths).
   *
   * @param complaintId - The complaint UUID
   * @returns The mapped complaint
   * @throws {NotFoundException} If complaint does not exist
   * @private
   */
  private async getComplaintRowMapped(
    complaintId: string,
  ): Promise<ComplaintResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const { data, error } = (await adminClient
      .from('complaints')
      .select(COMPLAINT_SELECT_WITH_ASSIGNED)
      .eq('id', complaintId)
      .single()) as DbResult<ComplaintRow>;
    if (error || !data) {
      throw new NotFoundException('Complaint not found');
    }
    return this.mapComplaintRow(data);
  }

  /**
   * Maps a database row (snake_case) to a ComplaintResponse object (camelCase)
   * Includes the joined staff profile name when available
   *
   * @param row - The raw database row with optional joined staff profile
   * @returns The mapped complaint response object
   * @private
   */
  private mapComplaintRow(row: ComplaintRow): ComplaintResponse {
    return {
      id: row.id,
      complaintNumber: row.complaint_number,
      clientProfileId: row.client_profile_id ?? null,
      title: row.title,
      description: row.description,
      targetOrganization: row.target_organization,
      location: row.location ?? null,
      category: row.category ?? null,
      evidenceUrls: row.evidence_urls ?? [],
      status: row.status,
      assignedToId: row.assigned_to_id ?? null,
      assignedToName: row.assigned_to?.full_name ?? null,
      staffNotes: row.staff_notes ?? null,
      resolutionNotes: row.resolution_notes ?? null,
      resolvedAt: row.resolved_at ?? null,
      fullName: row.full_name ?? null,
      email: row.email ?? null,
      phoneNumber: row.phone_number ?? null,
      cnic: row.cnic ?? null,
      city: row.city ?? null,
      address: row.address ?? null,
      department: row.department ?? null,
      institutionReference: row.institution_reference ?? null,
      issueType: row.issue_type ?? null,
      incidentDate: row.incident_date ?? null,
      desiredOutcome: row.desired_outcome ?? null,
      priorAttempts: row.prior_attempts ?? null,
      priorAttemptReference: row.prior_attempt_reference ?? null,
      paymentStatus: row.payment_status,
      paymentProofPath: row.payment_proof_path ?? null,
      paymentReviewNote: row.payment_review_note ?? null,
      paymentConfirmedAt: row.payment_confirmed_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
