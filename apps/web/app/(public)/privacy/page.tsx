import React from 'react';

export const metadata = {
    title: 'Privacy Policy | AR&CO',
    description: 'Privacy Policy for AR&CO Law Firm.',
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
}

const SECTION_GAP: React.CSSProperties = { marginBottom: '3rem' }

const CONTACT_DIVIDER: React.CSSProperties = {
    borderTop: '1px solid rgba(212, 175, 55, 0.12)',
    paddingTop: '2.5rem',
    marginTop: '1rem',
}

const LINK: React.CSSProperties = {
    color: 'var(--heritage-gold, #D4AF37)',
    textDecoration: 'none',
}

export default function PrivacyPolicy() {
    return (
        <main style={PAGE}>
            <div style={GRAIN} aria-hidden="true" />

            <div style={INNER}>
                {/* Header */}
                <div style={{ marginBottom: '4rem' }}>
                    <span style={EYEBROW}>Legal Directory</span>
                    <h1 style={H1}>Privacy Policy — AR&amp;Co.</h1>
                    <div style={DIVIDER} />
                </div>

                {/* Content */}
                <div>
                    <section style={SECTION_GAP}>
                        <h2 style={H2}>Introduction</h2>
                        <p style={BODY}>
                            At AR&amp;Co., we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your information when you use our website, online services, or visit our facilitation center in Islamabad.
                        </p>
                    </section>

                    <section style={{ ...SECTION_GAP, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div>
                            <h3 style={H3}>Information We Collect</h3>
                            <p style={BODY}>
                                We may collect personal information including your name, phone number, email address, CNIC, postal address, date of birth, business details, required documents, and payment information processed through secure third-party providers. We may also collect technical information such as IP address, browser type, and website usage data.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Purpose of Collecting Information</h3>
                            <p style={BODY}>
                                We use your information to process registrations, certifications, and licensing applications; provide legal facilitation services; communicate updates; comply with legal requirements; maintain records; improve services; and prevent fraud.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Information Necessary to Provide Services</h3>
                            <p style={BODY}>
                                Certain information including identity details, documentation, and payment information is necessary to deliver services. Failure to provide required information may result in delays or inability to process your request.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Communications</h3>
                            <p style={BODY}>
                                We may contact you via phone, email, or SMS regarding application updates, required documents, service confirmations, and important notices. You may opt out of promotional communications.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Sharing of Information</h3>
                            <p style={BODY}>
                                We may share information with government authorities, regulatory bodies, and service providers such as payment processors and IT providers to complete requested services. We may also disclose information where required by law.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Third-Party Services</h3>
                            <p style={BODY}>
                                If services involve third parties or government departments, your data may be shared as necessary to complete the process. AR&amp;Co. is not responsible for third-party data practices.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Data Security</h3>
                            <p style={BODY}>
                                We implement security measures including secure transmission protocols, restricted access, and secure storage to protect your personal information.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Data Retention</h3>
                            <p style={BODY}>
                                We retain personal information only as long as necessary to complete services, comply with legal requirements, and maintain records. Data is securely deleted when no longer required.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Your Privacy Rights</h3>
                            <p style={BODY}>
                                You may request access, correction, or deletion of your personal information, withdraw consent where applicable, and opt out of promotional communications.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Cookies &amp; Analytics</h3>
                            <p style={BODY}>
                                Our website may use cookies or analytics tools to improve user experience and monitor site performance.
                            </p>
                        </div>
                        <div>
                            <h3 style={H3}>Changes to This Policy</h3>
                            <p style={BODY}>
                                We may update this Privacy Policy from time to time. Continued use of our services constitutes acceptance of any updates.
                            </p>
                        </div>
                    </section>

                    <section style={CONTACT_DIVIDER}>
                        <h3 style={H3}>Contact Information</h3>
                        <p style={{ ...BODY, marginBottom: '0.25rem', color: 'var(--heritage-gold, #D4AF37)', opacity: 0.9 }}>AR&amp;Co.</p>
                        <p style={{ ...BODY, marginBottom: '0.25rem' }}>Islamabad, Pakistan</p>
                        <p style={{ ...BODY, marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--heritage-gold, #D4AF37)', opacity: 0.8 }}>Email: </span>
                            <a href="mailto:info@arco.law" style={LINK}>info@arco.law</a>
                        </p>
                        <p style={BODY}>
                            <span style={{ color: 'var(--heritage-gold, #D4AF37)', opacity: 0.8 }}>Phone: </span>
                            <a href="tel:+92512252144" style={LINK}>+92 51 2252144</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
