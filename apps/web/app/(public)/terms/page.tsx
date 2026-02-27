import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Terms and Conditions | AR&CO',
    description: 'Terms and Conditions for AR&CO Law Firm.',
};

// ── Shared inline style blocks ───────────────────────────────────────────────

const PAGE: React.CSSProperties = {
    minHeight: '100vh',
    background: `
        radial-gradient(ellipse 80% 50% at 20% -10%, rgba(212, 175, 55, 0.035) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(212, 175, 55, 0.02) 0%, transparent 50%),
        #0d0906
    `,
    color: 'var(--heritage-cream, #F9F8F6)',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: '10rem',
    paddingBottom: '6rem',
}

const GRAIN: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: 0.25,
    pointerEvents: 'none',
    zIndex: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    backgroundSize: '256px 256px',
}

const INNER: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    maxWidth: '860px',
    margin: '0 auto',
    padding: '0 1.5rem',
    fontFamily: "'Lora', Georgia, serif",
}

const EYEBROW: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: '0.62rem',
    fontWeight: 500,
    letterSpacing: '0.4em',
    textTransform: 'uppercase',
    color: 'var(--heritage-gold, #D4AF37)',
    opacity: 0.65,
    marginBottom: '1rem',
}

const H1: React.CSSProperties = {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
    fontWeight: 300,
    fontStyle: 'italic',
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    color: 'var(--heritage-cream, #F9F8F6)',
    margin: '0 0 1.5rem',
}

const DIVIDER: React.CSSProperties = {
    width: '100%',
    height: '1px',
    background: 'rgba(249, 248, 246, 0.1)',
    margin: '2.5rem 0 0',
}

const H2: React.CSSProperties = {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)',
    fontWeight: 300,
    fontStyle: 'italic',
    letterSpacing: '-0.02em',
    color: 'var(--heritage-cream, #F9F8F6)',
    marginBottom: '1rem',
}

const H3: React.CSSProperties = {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
    fontWeight: 400,
    fontStyle: 'italic',
    letterSpacing: '-0.01em',
    color: 'var(--heritage-gold, #D4AF37)',
    marginBottom: '0.65rem',
    opacity: 0.9,
}

const BODY: React.CSSProperties = {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: '0.9rem',
    lineHeight: 1.8,
    color: 'rgba(249, 248, 246, 0.6)',
    marginBottom: '1rem',
}

const SECTION_GAP: React.CSSProperties = { marginBottom: '3.5rem' }

const SUBSECTION_GAP: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '2.5rem' }

const CONTACT_DIVIDER: React.CSSProperties = {
    borderTop: '1px solid rgba(212, 175, 55, 0.12)',
    paddingTop: '2.5rem',
    marginTop: '1rem',
}

const GOLD_LINK: React.CSSProperties = {
    color: 'var(--heritage-gold, #D4AF37)',
    textDecoration: 'underline',
}

const LINK: React.CSSProperties = {
    color: 'var(--heritage-gold, #D4AF37)',
    textDecoration: 'none',
}

export default function TermsAndConditions() {
    return (
        <main style={PAGE}>
            <div style={GRAIN} aria-hidden="true" />

            <div style={INNER}>
                {/* Header */}
                <div style={{ marginBottom: '4rem' }}>
                    <span style={EYEBROW}>Legal Directory</span>
                    <h1 style={H1}>AR&amp;Co — Terms &amp; Conditions</h1>
                    <div style={DIVIDER} />
                </div>

                {/* Content */}
                <div>
                    {/* Important Notice */}
                    <section style={SECTION_GAP}>
                        <h2 style={H2}>Important Legal Notice</h2>
                        <p style={BODY}>
                            This page sets out the terms and conditions (&ldquo;Terms&rdquo;) on which we, AR&amp;Co, provide access to our website{' '}
                            <Link href="/" style={GOLD_LINK}>https://arco.law</Link>.{' '}
                            Please read these Terms carefully before availing any services through the Platform. By availing any services through the Platform (whether now or in the future), you agree to be bound by these Platform Terms.
                        </p>
                        <p style={BODY}>
                            We reserve the right to change these Platform Terms from time to time by changing them on this page. We advise you to print a copy of these Platform Terms for future reference. These Terms are only in the English language.
                        </p>
                        <p style={BODY}>
                            Use of your personal information submitted via the Platform is governed by our{' '}
                            <Link href="/privacy" style={GOLD_LINK}>Privacy Policy</Link>.
                        </p>
                        <p style={BODY}>
                            For the avoidance of doubt, references to &ldquo;Platform&rdquo; in these Terms include any current or future version of our website{' '}
                            <Link href="/" style={GOLD_LINK}>https://arco.law</Link>{' '}
                            and any mobile application through which you access and use our Platform.
                        </p>
                        <p style={{ ...BODY, marginBottom: 0 }}>
                            By accessing any part of the Platform, you indicate that you accept these Terms. If you do not accept these Terms, you should leave the Platform immediately.
                        </p>
                    </section>

                    {/* T&C of Use and Sale */}
                    <section style={SECTION_GAP}>
                        <h2 style={H2}>Terms and Conditions of Use and Sale</h2>
                        <div style={SUBSECTION_GAP}>
                            <div>
                                <h3 style={H3}>Platform Access</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    AR&amp;Co. provides an online platform for legal assistance and administrative processing in Pakistan. You may access and use our services through our website or in person at our Islamabad office. Registration or login is optional; an account is not required to use the services. We may modify or suspend platform access at any time. By using our services, you agree to these Terms.
                                </p>
                            </div>
                            <div>
                                <h3 style={H3}>Services Offered</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    AR&amp;Co. offers facilitation and advisory services for legal and administrative processes in Pakistan, including company registration, tax registration and filing, licensing, certifications, attestations, and related services. We assist in preparing and submitting applications but do not issue official licenses or approvals.
                                </p>
                            </div>
                            <div>
                                <h3 style={H3}>Payments</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    All fees must be paid before or at the time services begin. We accept online payments and in-person payments where agreed. Government and third-party fees remain the responsibility of the client and may be collected on their behalf. All fees are quoted in Pakistani Rupees and exclude applicable taxes.
                                </p>
                            </div>
                            <div>
                                <h3 style={H3}>Refunds and Cancellations</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    Once a service has been initiated, fees are non-refundable and services cannot be cancelled. If AR&amp;Co. is unable to start the service due to reasons within our control, paid fees will be refunded.
                                </p>
                            </div>
                            <div>
                                <h3 style={H3}>User Responsibilities</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    You agree to provide accurate information, supply required documents promptly, comply with applicable laws, and ensure documents meet official requirements. Delays or rejections caused by incomplete or incorrect information are the user&apos;s responsibility.
                                </p>
                            </div>
                            <div>
                                <h3 style={H3}>Third-Party Processing and Timeframes</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    Many services involve government or third-party processing handled manually. Processing times and outcomes are determined by relevant authorities. AR&amp;Co. does not control decisions, timelines, or additional requirements requested by authorities.
                                </p>
                            </div>
                            <div>
                                <h3 style={H3}>Limitation of Liability</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    AR&amp;Co. shall not be liable for indirect or consequential damages. Total liability shall not exceed the fees paid for the service in question.
                                </p>
                            </div>
                            <div>
                                <h3 style={H3}>Disclaimers</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    AR&amp;Co. does not guarantee outcomes. Processing times may vary. We are not a government authority and cannot influence decisions. Services are intended for use within Pakistan only.
                                </p>
                            </div>
                            <div>
                                <h3 style={H3}>Governing Law</h3>
                                <p style={{ ...BODY, marginBottom: 0 }}>
                                    These Terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes shall fall under the jurisdiction of Islamabad courts.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section style={CONTACT_DIVIDER}>
                        <h3 style={H3}>Contact Information</h3>
                        <p style={{ ...BODY, marginBottom: '0.25rem', color: 'var(--heritage-gold, #D4AF37)', opacity: 0.9 }}>AR&amp;Co.</p>
                        <p style={{ ...BODY, marginBottom: '0.25rem' }}>Islamabad, Pakistan</p>
                        <p style={{ ...BODY, marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--heritage-gold, #D4AF37)', opacity: 0.8 }}>Email: </span>
                            <a href="mailto:info@arco.law" style={LINK}>info@arco.law</a>
                        </p>
                        <p style={{ ...BODY, marginBottom: 0 }}>
                            <span style={{ color: 'var(--heritage-gold, #D4AF37)', opacity: 0.8 }}>Phone: </span>
                            <a href="tel:+92512252144" style={LINK}>+92 51 2252144</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
