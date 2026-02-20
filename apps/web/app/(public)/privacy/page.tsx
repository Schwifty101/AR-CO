import React from 'react';

export const metadata = {
    title: 'Privacy Policy | AR&CO',
    description: 'Privacy Policy for AR&CO Law Firm.',
};

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen section-wood pt-40 pb-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto" style={{ fontFamily: "'Lora', serif" }}>
                {/* Header Section */}
                <div className="mb-16">
                    <p className="section-label mb-4">Legal Directory</p>
                    <h1 className="section-title-large mb-6 text-heritage-cream" style={{ fontFamily: "'Lora', serif" }}>Privacy Policy - AR&Co.</h1>
                    <div className="w-full h-[1px] bg-heritage-cream/20 mt-8"></div>
                </div>

                {/* Content Section */}
                <div className="space-y-12 editorial-body text-heritage-cream w-full max-w-none">

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-heritage-gold">Introduction</h2>
                        <p className="text-heritage-cream/90">
                            At AR&Co., we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your information when you use our website, online services, or visit our facilitation center in Islamabad.
                        </p>
                    </section>

                    <section className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Information We Collect</h3>
                            <p className="text-heritage-cream/90">
                                We may collect personal information including your name, phone number, email address, CNIC, postal address, date of birth, business details, required documents, and payment information processed through secure third-party providers. We may also collect technical information such as IP address, browser type, and website usage data.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Purpose of Collecting Information</h3>
                            <p className="text-heritage-cream/90">
                                We use your information to process registrations, certifications, and licensing applications; provide legal facilitation services; communicate updates; comply with legal requirements; maintain records; improve services; and prevent fraud.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Information Necessary to Provide Services</h3>
                            <p className="text-heritage-cream/90">
                                Certain information including identity details, documentation, and payment information is necessary to deliver services. Failure to provide required information may result in delays or inability to process your request.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Communications</h3>
                            <p className="text-heritage-cream/90">
                                We may contact you via phone, email, or SMS regarding application updates, required documents, service confirmations, and important notices. You may opt out of promotional communications.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Sharing of Information</h3>
                            <p className="text-heritage-cream/90">
                                We may share information with government authorities, regulatory bodies, and service providers such as payment processors and IT providers to complete requested services. We may also disclose information where required by law.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Third-Party Services</h3>
                            <p className="text-heritage-cream/90">
                                If services involve third parties or government departments, your data may be shared as necessary to complete the process. AR&Co. is not responsible for third-party data practices.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Data Security</h3>
                            <p className="text-heritage-cream/90">
                                We implement security measures including secure transmission protocols, restricted access, and secure storage to protect your personal information.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Data Retention</h3>
                            <p className="text-heritage-cream/90">
                                We retain personal information only as long as necessary to complete services, comply with legal requirements, and maintain records. Data is securely deleted when no longer required.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Your Privacy Rights</h3>
                            <p className="text-heritage-cream/90">
                                You may request access, correction, or deletion of your personal information, withdraw consent where applicable, and opt out of promotional communications.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Cookies & Analytics</h3>
                            <p className="text-heritage-cream/90">
                                Our website may use cookies or analytics tools to improve user experience and monitor site performance.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Changes to This Policy</h3>
                            <p className="text-heritage-cream/90">
                                We may update this Privacy Policy from time to time. Continued use of our services constitutes acceptance of any updates.
                            </p>
                        </div>
                    </section>

                    <section className="pt-8 border-t border-heritage-cream/20">
                        <h3 className="text-xl font-semibold mb-4 text-heritage-gold">Contact Information</h3>
                        <p className="mb-1"><span className="font-semibold text-heritage-gold">AR&Co.</span></p>
                        <p className="mb-1 text-heritage-cream/90">Islamabad, Pakistan</p>
                        <p className="mb-1 text-heritage-cream/90">
                            <span className="font-semibold text-heritage-gold">Email: </span>
                            <a href="mailto:info@arco.law" className="text-heritage-gold hover:text-white transition-colors hover:underline">info@arco.law</a>
                        </p>
                        <p className="text-heritage-cream/90">
                            <span className="font-semibold text-heritage-gold">Phone: </span>
                            <a href="tel:+92512252144" className="text-heritage-gold hover:text-white transition-colors hover:underline">+92 51 2252144</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
