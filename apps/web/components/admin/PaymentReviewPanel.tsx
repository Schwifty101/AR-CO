'use client';

/**
 * PaymentReviewPanel
 *
 * Admin control for reviewing a manually-uploaded payment screenshot. Shows a
 * "View screenshot" link (via a short-lived signed URL) and Confirm / Flag
 * actions. Used by both the consultations and service-registration admin views.
 *
 * @module AdminComponents
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { FileImage, CheckCircle2, Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ReviewPaymentData } from '@repo/shared';

/** Props for {@link PaymentReviewPanel}. */
interface PaymentReviewPanelProps {
  /** Current payment status string (e.g. 'awaiting_confirmation', 'paid', 'flagged') */
  paymentStatus: string;
  /** Whether a screenshot has been uploaded */
  hasProof: boolean;
  /** Fetches a signed URL to view the uploaded screenshot */
  getProofUrl: () => Promise<string>;
  /** Submits the review (confirm/flag) to the backend */
  onReview: (data: ReviewPaymentData) => Promise<void>;
  /** Called after a successful review so the parent can refresh */
  onReviewed: () => void;
}

/**
 * Renders the admin payment-review controls.
 *
 * @example
 * ```tsx
 * <PaymentReviewPanel
 *   paymentStatus={booking.paymentStatus}
 *   hasProof={!!booking.paymentProofPath}
 *   getProofUrl={() => getConsultationProofUrl(booking.id)}
 *   onReview={(d) => reviewConsultationPayment(booking.id, d)}
 *   onReviewed={refresh}
 * />
 * ```
 */
export default function PaymentReviewPanel({
  paymentStatus,
  hasProof,
  getProofUrl,
  onReview,
  onReviewed,
}: PaymentReviewPanelProps) {
  const [loadingProof, setLoadingProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [note, setNote] = useState('');

  const isPaid = paymentStatus === 'paid';

  const handleViewProof = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingProof(true);
    try {
      const url = await getProofUrl();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load screenshot');
    } finally {
      setLoadingProof(false);
    }
  };

  const submit = async (data: ReviewPaymentData) => {
    setSubmitting(true);
    try {
      await onReview(data);
      toast.success(data.action === 'confirm' ? 'Payment confirmed' : 'Payment flagged');
      setShowFlag(false);
      setNote('');
      onReviewed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-md border p-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Payment Review</p>
        {hasProof ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewProof}
            disabled={loadingProof}
          >
            {loadingProof ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileImage className="h-3.5 w-3.5" />}
            View screenshot
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">No screenshot uploaded</span>
        )}
      </div>

      {isPaid ? (
        <p className="text-xs text-green-600">Payment confirmed.</p>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting}
              onClick={() => submit({ action: 'confirm' })}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm Payment
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={submitting}
              onClick={() => setShowFlag((s) => !s)}
            >
              <Flag className="h-3.5 w-3.5" />
              Flag
            </Button>
          </div>

          {showFlag && (
            <div className="space-y-2">
              <Textarea
                placeholder="Reason (shown to the client in the email)…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={submitting || !note.trim()}
                onClick={() => submit({ action: 'flag', note: note.trim() })}
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
                Submit Flag
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
