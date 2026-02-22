'use client';

/**
 * Subscribe Landing Page
 *
 * Public landing page for the "Civic Retainer" subscription service.
 * Fetches plans from API, checks user auth and subscription state,
 * and launches Safepay popup checkout for new subscriptions.
 *
 * @module SubscribePage
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { usePaymentPopup } from '@/components/payment/usePaymentPopup';
import {
  getSubscriptionPlans,
  initiateSubscription,
  getMySubscription,
} from '@/lib/api/subscriptions';
import type { SubscriptionPlan, SubscriptionDetail } from '@/lib/api/subscriptions';
import { toast } from 'sonner';
import { CheckCircle2, Scale, FileText, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

/** Framer Motion variants */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * Format a date string for display
 *
 * @param dateStr - ISO date string or null
 * @returns Formatted date like "Feb 18, 2026" or "N/A"
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get the CSS class for a subscription status badge
 *
 * @param status - Subscription status string
 * @returns CSS module class name for the badge
 */
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return styles.statusBadgeActive;
    case 'cancelled':
      return styles.statusBadgeCancelled;
    case 'pending':
    case 'unpaid':
    case 'paused':
      return styles.statusBadgePending;
    case 'ended':
    case 'failed':
      return styles.statusBadgeEnded;
    default:
      return styles.statusBadgePending;
  }
}

/**
 * Whether a subscription status allows resubscription
 *
 * @param status - Subscription status string
 * @returns True if the user can subscribe again
 */
function canResubscribe(status: string): boolean {
  return ['cancelled', 'ended', 'failed'].includes(status);
}

export default function SubscribePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscription, setMySubscription] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  /** Handle successful payment from popup */
  const handlePaymentSuccess = useCallback(() => {
    toast.success('Subscription activated! Redirecting to your dashboard...');
    setTimeout(() => {
      router.push('/client/dashboard');
    }, 2000);
  }, [router]);

  const { openPopup, isOpen: popupIsOpen } = usePaymentPopup({
    source: 'subscription',
    onSuccess: handlePaymentSuccess,
    onCancel: () => {
      toast.error('Payment was cancelled. You can try again anytime.');
      setSubscribing(false);
    },
    onError: (message) => {
      toast.error(message);
      setSubscribing(false);
    },
  });

  /** Fetch plans (public) and subscription (if authenticated) on mount */
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const fetchedPlans = await getSubscriptionPlans();
        if (!cancelled) {
          setPlans(fetchedPlans);
        }
      } catch {
        if (!cancelled) {
          // Plans fetch failed — fall back to hardcoded display
          setPlans([]);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  /** Fetch user's subscription when auth state is resolved */
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: resetting state when auth changes
      setMySubscription(null);
      return;
    }

    let cancelled = false;

    async function fetchSubscription() {
      try {
        const sub = await getMySubscription();
        if (!cancelled) {
          setMySubscription(sub);
        }
      } catch {
        if (!cancelled) {
          setMySubscription(null);
        }
      }
    }

    fetchSubscription();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  /** Determine the primary plan to display */
  const plan = plans.length > 0 ? plans[0] : null;
  const planName = plan?.name ?? 'Civic Retainer Service';
  const planAmount = plan ? `PKR ${(plan.amount / 100).toLocaleString()}` : 'PKR 700';
  const planSlug = plan?.slug ?? 'civic-retainer';
  const planFeatures = plan?.features ?? [];
  const planInterval =
    plan?.interval === 'WEEK'
      ? 'per week'
      : plan?.interval === 'DAY'
        ? 'per day'
        : 'per month';

  /** Whether the user has an active (non-resubscribable) subscription */
  const hasActiveSub =
    mySubscription !== null && !canResubscribe(mySubscription.status);

  /** Whether the user had a subscription but it ended / was cancelled */
  const hasEndedSub =
    mySubscription !== null && canResubscribe(mySubscription.status);

  /** Handle subscribe button click */
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/subscribe');
      return;
    }

    if (user?.userType !== 'client') {
      toast.error(
        'Only client accounts can subscribe. Please sign in with a client account.',
      );
      return;
    }

    setSubscribing(true);

    try {
      const { checkoutUrl } = await initiateSubscription(planSlug);
      openPopup(checkoutUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to initiate subscription';
      toast.error(message);
      setSubscribing(false);
    }
  };

  /** Determine CTA button text */
  const getButtonText = (): string => {
    if (subscribing || popupIsOpen) return 'Processing...';
    if (!isAuthenticated) return 'Sign In to Subscribe';
    if (hasEndedSub) return 'Resubscribe';
    return 'Subscribe Now';
  };

  /** Determine CTA subtitle text */
  const getCtaSubtitle = (): string => {
    if (!isAuthenticated) return 'Sign in to your account to subscribe';
    if (hasEndedSub) return 'Your previous subscription has ended. Subscribe again to continue.';
    return 'Click below to activate your subscription';
  };

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.atmosphereGlow} />
        <div className={styles.grainOverlay} />
        <div className={styles.loading}>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Atmosphere */}
      <div className={styles.atmosphereGlow} />
      <div className={styles.grainOverlay} />

      <div className={styles.container}>
        {/* Hero Section */}
        <motion.div
          className={styles.hero}
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.span className={styles.eyebrow} variants={fadeUp}>
            Legal Subscription Service
          </motion.span>

          <motion.h1 className={styles.title} variants={fadeUp}>
            {planName}
          </motion.h1>

          <motion.p className={styles.subtitle} variants={fadeUp}>
            Your Voice, Our Advocacy — Professional legal support for
            government-related matters
          </motion.p>

          <motion.p className={styles.price} variants={fadeUp}>
            {planAmount} {planInterval}
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          className={styles.benefitsGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div className={styles.benefitCard} variants={fadeUp}>
            <FileText className={styles.benefitIcon} />
            <h3 className={styles.benefitTitle}>Submit Complaints</h3>
            <p className={styles.benefitDescription}>
              File official complaints against government organizations directly
              through our platform
            </p>
          </motion.div>

          <motion.div className={styles.benefitCard} variants={fadeUp}>
            <CheckCircle2 className={styles.benefitIcon} />
            <h3 className={styles.benefitTitle}>Track Progress</h3>
            <p className={styles.benefitDescription}>
              Monitor your complaint status in real-time with detailed resolution
              tracking
            </p>
          </motion.div>

          <motion.div className={styles.benefitCard} variants={fadeUp}>
            <Scale className={styles.benefitIcon} />
            <h3 className={styles.benefitTitle}>Legal Support</h3>
            <p className={styles.benefitDescription}>
              Access professional legal guidance throughout the complaint
              resolution process
            </p>
          </motion.div>
        </motion.div>

        {/* Subscription Details */}
        <motion.div
          className={styles.detailsSection}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 className={styles.detailsTitle} variants={fadeUp}>
            What&apos;s Included
          </motion.h2>
          <motion.p className={styles.detailsSubtitle} variants={fadeUp}>
            Comprehensive support for your civic engagement
          </motion.p>

          <motion.ul
            className={styles.featureList}
            variants={listStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
          >
            {planFeatures.length > 0
              ? planFeatures.map((feature: string) => (
                  <motion.li
                    key={feature}
                    className={styles.featureItem}
                    variants={itemFadeUp}
                  >
                    <CheckCircle2 className={styles.featureIcon} />
                    <span className={styles.featureText}>{feature}</span>
                  </motion.li>
                ))
              : /* Fallback features if API returns none */
                [
                  'Unlimited complaint submissions against government organizations',
                  'Real-time tracking and status updates for all your complaints',
                  'Professional legal review and guidance for each complaint',
                  'Direct communication channel with legal experts',
                  'Priority email and phone support during business hours',
                ].map((feature) => (
                  <motion.li
                    key={feature}
                    className={styles.featureItem}
                    variants={itemFadeUp}
                  >
                    <CheckCircle2 className={styles.featureIcon} />
                    <span className={styles.featureText}>{feature}</span>
                  </motion.li>
                ))}
          </motion.ul>
        </motion.div>

        {/* CTA Section — conditional based on auth + subscription state */}
        {hasActiveSub && mySubscription ? (
          /* User has active subscription: show status card */
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.div className={styles.statusCard} variants={fadeUp}>
              <h2 className={styles.statusTitle}>
                You&apos;re Subscribed
              </h2>
              <p className={styles.statusSubtitle}>
                Your {mySubscription.plan.name} subscription is active
              </p>

              <span
                className={`${styles.statusBadge} ${getStatusBadgeClass(mySubscription.status)}`}
              >
                {mySubscription.status}
              </span>

              <div className={styles.statusDetails}>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Plan</span>
                  <span className={styles.statusValue}>
                    {mySubscription.plan.name}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Status</span>
                  <span className={styles.statusValue}>
                    {mySubscription.status.charAt(0).toUpperCase() +
                      mySubscription.status.slice(1)}
                  </span>
                </div>
                {mySubscription.currentPeriodStart && (
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Current Period</span>
                    <span className={styles.statusValue}>
                      {formatDate(mySubscription.currentPeriodStart)} &mdash;{' '}
                      {formatDate(mySubscription.currentPeriodEnd)}
                    </span>
                  </div>
                )}
                {mySubscription.lastPaidAt && (
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Last Paid</span>
                    <span className={styles.statusValue}>
                      {formatDate(mySubscription.lastPaidAt)}
                    </span>
                  </div>
                )}
              </div>

              <Link href="/client/dashboard" className={styles.manageLink}>
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          /* Not subscribed or subscription ended: show subscribe CTA */
          <motion.div
            className={styles.ctaSection}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.div className={styles.ctaCard} variants={fadeUp}>
              <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
              <p className={styles.ctaSubtitle}>{getCtaSubtitle()}</p>

              <div className={styles.priceDisplay}>
                <p className={styles.priceAmount}>{planAmount}</p>
                <p className={styles.pricePeriod}>{planInterval}</p>
              </div>

              <button
                className={styles.ctaButton}
                onClick={handleSubscribe}
                disabled={subscribing || popupIsOpen}
              >
                <span className={styles.buttonText}>{getButtonText()}</span>
              </button>

              {isAuthenticated && !hasEndedSub && (
                <p className={styles.ctaNote}>
                  You will be redirected to our secure payment gateway
                </p>
              )}

              {hasEndedSub && mySubscription && (
                <p className={styles.ctaNote}>
                  Your previous subscription was{' '}
                  {mySubscription.status === 'cancelled' ? 'cancelled' : 'ended'}{' '}
                  on {formatDate(mySubscription.cancelledAt ?? mySubscription.currentPeriodEnd)}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Trust Section */}
        <motion.div
          className={styles.trustSection}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.trustText}>
            <Users className={styles.trustIcon} />
            <p>
              Trusted by clients seeking fair resolution of civic matters
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
