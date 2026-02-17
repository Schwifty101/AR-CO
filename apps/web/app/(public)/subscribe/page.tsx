'use client';

/**
 * Subscribe Landing Page
 *
 * Public landing page for the "Civic Retainer" subscription service.
 * Redesigned with editorial luxury aesthetic matching the blogs page.
 *
 * @module SubscribePage
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { toast } from 'sonner';
import { CheckCircle2, Scale, FileText, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

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

export default function SubscribePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=/subscribe');
      return;
    }

    if (user?.userType !== 'client') {
      toast.error('Only client accounts can subscribe. Please sign in with a client account.');
      return;
    }

    setSubscribing(true);
    toast.error('Subscription service is currently unavailable.');
    setSubscribing(false);
  };

  if (authLoading) {
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
            Civic Retainer Service
          </motion.h1>

          <motion.p className={styles.subtitle} variants={fadeUp}>
            Your Voice, Our Advocacy — Professional legal support for government-related matters
          </motion.p>

          <motion.p className={styles.price} variants={fadeUp}>
            PKR 700 per month
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
              File official complaints against government organizations directly through our platform
            </p>
          </motion.div>

          <motion.div className={styles.benefitCard} variants={fadeUp}>
            <CheckCircle2 className={styles.benefitIcon} />
            <h3 className={styles.benefitTitle}>Track Progress</h3>
            <p className={styles.benefitDescription}>
              Monitor your complaint status in real-time with detailed resolution tracking
            </p>
          </motion.div>

          <motion.div className={styles.benefitCard} variants={fadeUp}>
            <Scale className={styles.benefitIcon} />
            <h3 className={styles.benefitTitle}>Legal Support</h3>
            <p className={styles.benefitDescription}>
              Access professional legal guidance throughout the complaint resolution process
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
            What's Included
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
            <motion.li className={styles.featureItem} variants={itemFadeUp}>
              <CheckCircle2 className={styles.featureIcon} />
              <span className={styles.featureText}>
                Unlimited complaint submissions against government organizations
              </span>
            </motion.li>
            <motion.li className={styles.featureItem} variants={itemFadeUp}>
              <CheckCircle2 className={styles.featureIcon} />
              <span className={styles.featureText}>
                Real-time tracking and status updates for all your complaints
              </span>
            </motion.li>
            <motion.li className={styles.featureItem} variants={itemFadeUp}>
              <CheckCircle2 className={styles.featureIcon} />
              <span className={styles.featureText}>
                Professional legal review and guidance for each complaint
              </span>
            </motion.li>
            <motion.li className={styles.featureItem} variants={itemFadeUp}>
              <CheckCircle2 className={styles.featureIcon} />
              <span className={styles.featureText}>
                Direct communication channel with legal experts
              </span>
            </motion.li>
            <motion.li className={styles.featureItem} variants={itemFadeUp}>
              <CheckCircle2 className={styles.featureIcon} />
              <span className={styles.featureText}>
                Priority email and phone support during business hours
              </span>
            </motion.li>
          </motion.ul>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className={styles.ctaSection}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div className={styles.ctaCard} variants={fadeUp}>
            <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
            <p className={styles.ctaSubtitle}>
              {isAuthenticated
                ? 'Click below to activate your subscription'
                : 'Create an account to subscribe'}
            </p>

            <div className={styles.priceDisplay}>
              <p className={styles.priceAmount}>PKR 700</p>
              <p className={styles.pricePeriod}>per month</p>
            </div>

            <button
              className={styles.ctaButton}
              onClick={handleSubscribe}
              disabled={subscribing}
            >
              <span className={styles.buttonText}>
                {subscribing ? 'Processing...' : isAuthenticated ? 'Subscribe Now' : 'Sign Up to Subscribe'}
              </span>
            </button>

            {isAuthenticated && (
              <p className={styles.ctaNote}>
                You will be redirected to our secure payment gateway
              </p>
            )}
          </motion.div>
        </motion.div>

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
            <p>Trusted by clients seeking fair resolution of civic matters</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
