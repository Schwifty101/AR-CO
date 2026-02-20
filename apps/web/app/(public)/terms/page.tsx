import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Terms and Conditions | AR&CO',
    description: 'Terms and Conditions for AR&CO Law Firm.',
};

export default function TermsAndConditions() {
    return (
        <main className="min-h-screen section-wood pt-40 pb-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto" style={{ fontFamily: "'Lora', serif" }}>
                {/* Header Section */}
                <div className="mb-16">
                    <p className="section-label mb-4">Legal Directory</p>
                    <h1 className="section-title-large mb-6 text-heritage-cream" style={{ fontFamily: "'Lora', serif" }}>AR&Co - Terms and Conditions</h1>
                    <div className="w-full h-[1px] bg-heritage-cream/20 mt-8"></div>
                </div>

                {/* Content Section */}
                <div className="space-y-12 editorial-body text-heritage-cream w-full max-w-none">

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-heritage-gold">IMPORTANT LEGAL NOTICE</h2>
                        <p className="mb-4 text-heritage-cream">
                            This page sets out the terms and conditions ("Terms") on which we, AR&Co, provide access to our website{' '}
                            <Link href="/" className="underline text-heritage-gold hover:text-white transition-colors">
                                https://arco.law
                            </Link>{' '}
                            Please read these Terms carefully before availing any services through the Platform. By availing any services through the Platform (whether now or in the future), you agree to be bound by these Platform Terms. Use of the Platform is also subject to these Platform Terms.
                        </p>
                        <p className="mb-4 text-heritage-cream">
                            We reserve the right to change these Platform Terms from time to time by changing them on this page. We advise you to print a copy of these Platform Terms for future reference. These Terms are only in the English language.
                        </p>
                        <p className="mb-4 text-heritage-cream">
                            Use of your personal information submitted via the Platform is governed by our{' '}
                            <Link href="/privacy" className="underline text-heritage-gold hover:text-white transition-colors">
                                Privacy Policy
                            </Link>.
                        </p>
                        <p className="mb-4 text-heritage-cream">
                            For the avoidance of doubt, please note that references to "Platform" in these Terms include any current or future version of our website{' '}
                            <Link href="/" className="underline text-heritage-gold hover:text-white transition-colors">
                                https://arco.law
                            </Link>{' '}
                            and any mobile application through which you access and use our Platform, in each case whether accessed through any current or future platform or device (including without limitation any mobile website, mobile application, affiliate website or related website for accessing and using our Platform that may be developed from time to time).
                        </p>
                        <p className="text-heritage-cream">
                            By accessing any part of the Platform, you indicate that you accept these Terms. If you do not accept these Terms, you should leave the Platform immediately, and you will not be able to avail any services through the Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-heritage-gold uppercase tracking-wide">TERMS AND CONDITIONS OF USE AND SALE</h2>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Platform Access</h3>
                                <p className="text-heritage-cream/90">
                                    AR&Co. provides an online platform for legal assistance and administrative processing in Pakistan. You may access and use our services through our website or in person at our Islamabad office. Registration or login is optional; an account is not required to use the services. You are responsible for obtaining the necessary device and internet connection. We may modify or suspend platform access at any time. By using our services, you agree to these Terms.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Services Offered</h3>
                                <p className="text-heritage-cream/90">
                                    AR&Co. offers facilitation and advisory services for legal and administrative processes in Pakistan, including company registration, tax registration and filing, licensing, certifications, attestations, and related services. We assist in preparing and submitting applications but do not issue official licenses or approvals.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Payments</h3>
                                <p className="text-heritage-cream/90">
                                    All fees must be paid before or at the time services begin. We accept online payments and in-person payments where agreed. Government and third-party fees remain the responsibility of the client and may be collected on their behalf. All fees are quoted in Pakistani Rupees and exclude applicable taxes.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Refunds and Cancellations</h3>
                                <p className="text-heritage-cream/90">
                                    Once a service has been initiated, fees are non-refundable and services cannot be cancelled. If AR&Co. is unable to start the service due to reasons within our control, paid fees will be refunded.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">User Responsibilities</h3>
                                <p className="text-heritage-cream/90">
                                    You agree to provide accurate information, supply required documents promptly, comply with applicable laws, and ensure documents meet official requirements. Delays or rejections caused by incomplete or incorrect information are the user's responsibility.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Third-Party Processing and Timeframes</h3>
                                <p className="text-heritage-cream/90">
                                    Many services involve government or third-party processing handled manually. Processing times and outcomes are determined by relevant authorities. AR&Co. does not control decisions, timelines, or additional requirements requested by authorities.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Limitation of Liability</h3>
                                <p className="text-heritage-cream/90">
                                    AR&Co. shall not be liable for indirect or consequential damages. Total liability shall not exceed the fees paid for the service in question.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Disclaimers</h3>
                                <p className="text-heritage-cream/90">
                                    AR&Co. does not guarantee outcomes. Processing times may vary. We are not a government authority and cannot influence decisions. Services are intended for use within Pakistan only.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-heritage-gold">Governing Law</h3>
                                <p className="text-heritage-cream/90">
                                    These Terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes shall fall under the jurisdiction of Islamabad courts.
                                </p>
                            </div>
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
                            <a href="tel:+9251XXXXXXX" className="text-heritage-gold hover:text-white transition-colors hover:underline">+92 51 XXX XXXX</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
