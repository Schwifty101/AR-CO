export interface OverseasFAQ {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  duration: string;
}

export interface OverseasService {
  id: string;
  title: string;
  tagline: string;
  whatWeDo: string[];
  processSteps: ProcessStep[];
  whyYouNeedIt: string;
  whyChooseUs: string;
  faqs: OverseasFAQ[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea' | 'checkbox' | 'file' | 'radio';
  required: boolean;
  placeholder?: string;
  options?: string[];
  hint?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export const overseasServices: OverseasService[] = [
  {
    id: 'property-verification',
    title: 'Property Verification & Due Diligence',
    tagline: 'Know the truth before you invest',
    whatWeDo: [
      'Verify property ownership and title',
      'Conduct on-ground verification in Pakistan',
      'Review legal documents and status',
      'Provide written legal opinion with evidence',
    ],
    processSteps: [
      {
        title: 'Initial Assessment',
        description: 'Review property details, location, seller information, and documents provided by client',
        duration: '1-2 days',
      },
      {
        title: 'Title Verification',
        description: 'Verify ownership through revenue records (Fard, Intiqal), land registry, and checking for encumbrances or disputes',
        duration: '3-5 days',
      },
      {
        title: 'Physical Inspection',
        description: 'On-ground visit to property site, verify boundaries, possession status, and check for unauthorized occupants',
        duration: '2-3 days',
      },
      {
        title: 'Legal Document Review',
        description: 'Examine sale deeds, mutation records, NOCs, utility bills, and verify authenticity of all documents',
        duration: '2-4 days',
      },
      {
        title: 'Due Diligence Report',
        description: 'Prepare comprehensive report with legal opinion, risk assessment, photographs, and recommendations',
        duration: '2-3 days',
      },
    ],
    whyYouNeedIt: 'Overseas Pakistanis are most vulnerable to fraud, fake documents, and unauthorized sellers.',
    whyChooseUs: 'On-ground verification in Pakistan, written legal opinion, and transparent reporting with evidence.',
    faqs: [
      {
        question: 'How long does property verification take?',
        answer: 'Usually 7-14 days depending on location and document availability.',
      },
      {
        question: 'Do you verify properties outside major cities?',
        answer: 'Yes, we conduct verifications across Pakistan including rural areas.',
      },
    ],
  },
  {
    id: 'property-transaction',
    title: 'Sale, Purchase & Transfer of Property',
    tagline: 'Secure property transactions without being physically present',
    whatWeDo: [
      'Handle complete legal documentation',
      'Process property registration',
      'Execute through Power of Attorney',
      'Ensure compliance with local authorities',
    ],
    processSteps: [
      {
        title: 'Agreement & Documentation',
        description: 'Draft sale/purchase agreement, token money receipt, verify seller documents, and prepare deed on stamp paper',
        duration: '3-5 days',
      },
      {
        title: 'POA Execution',
        description: 'If client abroad, ensure valid Power of Attorney is executed, attested by Pakistan Embassy, and registered in Pakistan',
        duration: '1-2 weeks',
      },
      {
        title: 'Payment & Registration',
        description: 'Coordinate payment transfer, register sale deed with Sub-Registrar, pay stamp duty as per DC rates',
        duration: '2-3 days',
      },
      {
        title: 'Mutation & Transfer',
        description: 'Apply for mutation in revenue records (Patwari/Tehsildar), update ownership in land registry',
        duration: '3-6 weeks',
      },
      {
        title: 'Delivery & Handover',
        description: 'Complete possession transfer, update utility bills, provide registered deed and mutation certificate to client',
        duration: '1-2 weeks',
      },
    ],
    whyYouNeedIt: 'Improper documentation can lead to future disputes, loss of ownership, or blocked transfers.',
    whyChooseUs: 'End-to-end legal handling, POA-based execution, and compliance with local authorities.',
    faqs: [
      {
        question: 'Can I buy property in Pakistan while living abroad?',
        answer: 'Yes, through a valid Power of Attorney registered in Pakistan.',
      },
      {
        question: 'How do you ensure my money is secure during transaction?',
        answer: 'We use escrow mechanisms and coordinate payments only after proper documentation.',
      },
    ],
  },
  {
    id: 'property-disputes',
    title: 'Property Disputes & Illegal Possession',
    tagline: 'Protect what belongs to you',
    whatWeDo: [
      'Handle land grabbing cases',
      'File suits for illegal possession',
      'Represent in property disputes',
      'Provide court representation without travel',
    ],
    processSteps: [
      {
        title: 'Case Analysis',
        description: 'Review property documents, possession timeline, illegal occupant details, and assess legal position',
        duration: '2-3 days',
      },
      {
        title: 'Legal Notice',
        description: 'Issue legal notice to illegal occupants demanding vacation of property within specified period',
        duration: '1-2 days',
      },
      {
        title: 'Suit Filing',
        description: 'File suit for possession and declaration in relevant Civil Court, obtain urgent interim orders if possible',
        duration: '3-5 days',
      },
      {
        title: 'Court Proceedings',
        description: 'Attend hearings, present evidence and witnesses, pursue case through POA-based representation',
        duration: '6-18 months',
      },
      {
        title: 'Decree Execution',
        description: 'Upon favorable judgment, execute decree through court enforcement, recover possession with police assistance',
        duration: '2-6 months',
      },
    ],
    whyYouNeedIt: 'Delayed action often strengthens illegal occupants\' claims.',
    whyChooseUs: 'Strong litigation strategy, regular case updates, and court representation without travel.',
    faqs: [
      {
        question: 'How long do property dispute cases take?',
        answer: 'Usually 1-2 years depending on court workload and case complexity.',
      },
      {
        question: 'Will I need to come to Pakistan for hearings?',
        answer: 'Not usually - we represent you through valid Power of Attorney.',
      },
    ],
  },
  {
    id: 'power-of-attorney',
    title: 'Power of Attorney (POA) Services',
    tagline: 'Authorize legally. Stay in control',
    whatWeDo: [
      'Draft customized POA documents',
      'Include legal safeguards',
      'Process POA registration',
      'Provide embassy attestation guidance',
    ],
    processSteps: [
      {
        title: 'Requirement Analysis',
        description: 'Determine POA purpose (property, business, litigation), scope of authority, and duration',
        duration: '1 day',
      },
      {
        title: 'POA Drafting',
        description: 'Draft POA with specific powers, limitations, revocation clause, and protective terms to prevent misuse',
        duration: '1-2 days',
      },
      {
        title: 'Embassy Attestation',
        description: 'Guide client for execution before Pakistan Embassy/Consulate in country of residence',
        duration: '1-2 weeks',
      },
      {
        title: 'Registration in Pakistan',
        description: 'Register attested POA with Sub-Registrar in relevant jurisdiction in Pakistan',
        duration: '2-3 days',
      },
      {
        title: 'Delivery & Activation',
        description: 'Provide registered POA to attorney, maintain record, advise on usage and supervision',
        duration: '1-2 days',
      },
    ],
    whyYouNeedIt: 'Improper or misused POA can result in financial and property loss.',
    whyChooseUs: 'Customized POA drafting, legal safeguards included, and guidance on embassy attestation.',
    faqs: [
      {
        question: 'Can I cancel POA if I change my mind?',
        answer: 'Yes, POA can be revoked through proper legal procedure and public notice.',
      },
      {
        question: 'How do I ensure my POA is not misused?',
        answer: 'We include specific limitations, purpose clauses, and require regular reporting.',
      },
    ],
  },
  {
    id: 'family-law',
    title: 'Family Law (Divorce, Custody, Maintenance)',
    tagline: 'Sensitive matters handled with care and confidentiality',
    whatWeDo: [
      'Handle divorce proceedings',
      'File custody and visitation cases',
      'Process maintenance claims',
      'Provide court representation through POA',
    ],
    processSteps: [
      {
        title: 'Confidential Consultation',
        description: 'Discuss family matter, gather marriage documents, assess legal options under Muslim Family Laws Ordinance, 1961',
        duration: '1-2 days',
      },
      {
        title: 'Legal Notice / Khula Petition',
        description: 'Issue divorce notice through Union Council or file Khula petition in Family Court as applicable',
        duration: '2-3 days',
      },
      {
        title: 'Council / Court Proceedings',
        description: 'Attend arbitration council meetings or Family Court hearings, represent through POA if client abroad',
        duration: '2-6 months',
      },
      {
        title: 'Custody / Maintenance',
        description: 'If applicable, file separate suit for child custody (under Guardians Act) or maintenance (under Family Courts Act)',
        duration: '3-12 months',
      },
      {
        title: 'Decree & Implementation',
        description: 'Obtain final divorce decree, custody order, or maintenance order and advise on implementation',
        duration: '1-2 months',
      },
    ],
    whyYouNeedIt: 'Family disputes across borders are legally complex and emotionally stressful.',
    whyChooseUs: 'Confidential handling, court representation through POA, and clear legal guidance at every step.',
    faqs: [
      {
        question: 'Can I get divorce in Pakistan while living abroad?',
        answer: 'Yes, through proper legal representation with Power of Attorney.',
      },
      {
        question: 'How is child custody decided?',
        answer: 'Family Court considers child\'s welfare, age, and living arrangements under Guardians Act.',
      },
    ],
  },
  {
    id: 'inheritance-succession',
    title: 'Inheritance & Succession Matters',
    tagline: 'Your legal share, secured',
    whatWeDo: [
      'File succession certificate petitions',
      'Handle inheritance disputes',
      'Process asset distribution',
      'Coordinate with NADRA and courts',
    ],
    processSteps: [
      {
        title: 'Legal Heir Documentation',
        description: 'Collect death certificate, CNIC of deceased, Family Registration Certificate, identify all legal heirs and assets',
        duration: '3-5 days',
      },
      {
        title: 'Succession Certificate Petition',
        description: 'File petition in District Court under Succession Act, 1925 or apply for inheritance certificate under Sharia',
        duration: '2-3 days',
      },
      {
        title: 'Court Notices & Hearings',
        description: 'Court issues public notices in newspapers, conducts hearings to verify legal heirs',
        duration: '4-8 months',
      },
      {
        title: 'Asset Identification & Valuation',
        description: 'Identify all inherited assets (property, bank accounts, investments), obtain valuations',
        duration: '2-4 weeks',
      },
      {
        title: 'Distribution & Transfer',
        description: 'Upon certificate issuance, process transfer of assets to legal heirs as per Sharia or will',
        duration: '1-3 months',
      },
    ],
    whyYouNeedIt: 'Inheritance matters often get delayed due to missing documents or family disagreements.',
    whyChooseUs: 'Complete legal management, coordination with NADRA & courts, and hassle-free process for heirs abroad.',
    faqs: [
      {
        question: 'How long does succession certificate take?',
        answer: 'Usually 6-12 months depending on court workload and number of heirs.',
      },
      {
        question: 'Can overseas heirs claim inheritance in Pakistan?',
        answer: 'Yes, through valid documentation and legal representation.',
      },
    ],
  },
  {
    id: 'civil-litigation',
    title: 'Civil Litigation & Court Representation',
    tagline: 'Your case, professionally represented',
    whatWeDo: [
      'File civil suits and appeals',
      'Handle recovery matters',
      'Provide court appearances on your behalf',
      'Submit written progress reports',
    ],
    processSteps: [
      {
        title: 'Case Evaluation',
        description: 'Review dispute details, assess merits, determine jurisdiction, and advise on legal strategy',
        duration: '2-3 days',
      },
      {
        title: 'Plaint / Petition Drafting',
        description: 'Prepare civil suit plaint, appeal petition, or written statement with proper cause of action and relief',
        duration: '3-5 days',
      },
      {
        title: 'Court Filing',
        description: 'File case in relevant Civil Court, District Court, or High Court with court fees and process fee',
        duration: '1-2 days',
      },
      {
        title: 'Litigation & Hearings',
        description: 'Attend regular hearings, file applications, present evidence, cross-examine witnesses through POA representation',
        duration: '1-3 years',
      },
      {
        title: 'Judgment & Execution',
        description: 'Upon decree, execute judgment through proper legal channels, pursue appeals if needed',
        duration: '2-6 months',
      },
    ],
    whyYouNeedIt: 'Physical absence should not weaken your legal position.',
    whyChooseUs: 'Dedicated case handling, court appearances on your behalf, and written progress reports.',
    faqs: [
      {
        question: 'How often will I receive case updates?',
        answer: 'We provide written updates after each hearing and major development.',
      },
      {
        question: 'What if I need to appeal?',
        answer: 'We handle appeals in higher courts including High Court and Supreme Court.',
      },
    ],
  },
  {
    id: 'corporate-business',
    title: 'Corporate & Business Legal Services',
    tagline: 'Invest in Pakistan with legal confidence',
    whatWeDo: [
      'Process company registration with SECP',
      'Draft business contracts',
      'Handle compliance requirements',
      'Resolve business disputes',
    ],
    processSteps: [
      {
        title: 'Business Structuring',
        description: 'Advise on company structure (Pvt Ltd, SMC, LLP), foreign investment regulations, and tax implications',
        duration: '2-3 days',
      },
      {
        title: 'SECP Registration',
        description: 'Register company with Securities & Exchange Commission, obtain incorporation certificate and tax registrations',
        duration: '1-2 weeks',
      },
      {
        title: 'Contracts & Agreements',
        description: 'Draft shareholder agreements, partnership deeds, service contracts, MOUs, and NDAs',
        duration: '3-5 days',
      },
      {
        title: 'Compliance Setup',
        description: 'Establish compliance systems for annual filings, board meetings, regulatory reporting with SECP',
        duration: '1-2 weeks',
      },
      {
        title: 'Ongoing Support',
        description: 'Provide legal advice, contract review, dispute resolution, and regulatory compliance support',
        duration: 'Ongoing',
      },
    ],
    whyYouNeedIt: 'Poor structuring can expose businesses to legal and financial risk.',
    whyChooseUs: 'Practical business-focused advice, SECP compliance support, and clear documentation.',
    faqs: [
      {
        question: 'Can overseas Pakistanis own 100% of a company?',
        answer: 'Yes, 100% foreign ownership is allowed in most sectors under BOI regulations.',
      },
      {
        question: 'Do you help with foreign remittance for investment?',
        answer: 'We provide legal documentation for foreign remittance through proper banking channels.',
      },
    ],
  },
  {
    id: 'documentation-notarial',
    title: 'Documentation, Affidavits & Notarial Services',
    tagline: 'Legally valid documents done right',
    whatWeDo: [
      'Draft affidavits and declarations',
      'Prepare legal agreements',
      'Process notarization',
      'Ensure court and authority compliance',
    ],
    processSteps: [
      {
        title: 'Requirement Analysis',
        description: 'Understand document purpose, authority requirements (court, NADRA, embassy, etc.)',
        duration: '1 day',
      },
      {
        title: 'Drafting',
        description: 'Prepare affidavit, declaration, or agreement on proper stamp paper with legally correct language',
        duration: '1-2 days',
      },
      {
        title: 'Notarization / Oath Commissioner',
        description: 'Arrange execution before Oath Commissioner or Notary Public in Pakistan',
        duration: '1 day',
      },
      {
        title: 'Attestation (if required)',
        description: 'If document for overseas use, process attestation from Foreign Office or relevant authority',
        duration: '3-7 days',
      },
      {
        title: 'Delivery',
        description: 'Provide original attested document via courier or digital copy for immediate use',
        duration: '1-3 days',
      },
    ],
    whyYouNeedIt: 'Incorrect documents can be rejected by courts or authorities.',
    whyChooseUs: 'Legally sound drafting, court & authority compliance, and fast turnaround.',
    faqs: [
      {
        question: 'Can affidavits be prepared for overseas clients?',
        answer: 'Yes, we prepare affidavits that can be executed at Pakistan embassy abroad.',
      },
      {
        question: 'How quickly can documents be prepared?',
        answer: 'Usually 1-3 days for urgently needed documents.',
      },
    ],
  },
];

export const overseasRegistrationForm: FormSection[] = [
  {
    title: 'SERVICE SELECTION',
    fields: [
      {
        id: 'serviceRequired',
        label: 'Select the Service You Need',
        type: 'select',
        required: true,
        placeholder: 'Choose a service',
        options: [
          'Property Verification & Due Diligence',
          'Sale, Purchase & Transfer of Property',
          'Property Disputes & Illegal Possession',
          'Power of Attorney (POA) Services',
          'Family Law (Divorce, Custody, Maintenance)',
          'Inheritance & Succession Matters',
          'Civil Litigation & Court Representation',
          'Corporate & Business Legal Services',
          'Documentation, Affidavits & Notarial Services',
        ],
      },
    ],
  },
  {
    title: 'CLIENT INFORMATION',
    fields: [
      {
        id: 'fullName',
        label: 'Full Name (as per passport / CNIC)',
        type: 'text',
        required: true,
        placeholder: 'Enter your full legal name',
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your.email@example.com',
      },
      {
        id: 'contactNumber',
        label: 'Contact Number (WhatsApp preferred)',
        type: 'tel',
        required: true,
        placeholder: 'Country code + number',
        hint: 'e.g., +44 7700 900000 or +1 555 123 4567',
      },
      {
        id: 'countryOfResidence',
        label: 'Country of Residence',
        type: 'select',
        required: true,
        options: [
          'United Kingdom',
          'United States',
          'Canada',
          'UAE',
          'Saudi Arabia',
          'Australia',
          'Norway',
          'Germany',
          'Other',
        ],
        placeholder: 'Select your current country',
      },
    ],
  },
  {
    title: 'CLIENT CASE DETAILS',
    fields: [
      {
        id: 'caseDescription',
        label: 'Brief Description of Your Legal Matter',
        type: 'textarea',
        required: true,
        placeholder: 'Please provide key facts only',
        hint: 'Explain your matter in simple terms - no legal language needed',
      },
      {
        id: 'cityLocation',
        label: 'City / Location in Pakistan (if applicable)',
        type: 'text',
        required: false,
        placeholder: 'e.g., Islamabad, Lahore, Karachi, Rawalpindi',
      },
      {
        id: 'relevantAuthority',
        label: 'Against which Relevant Authority? (if any)',
        type: 'text',
        required: false,
        placeholder: 'e.g., CDA, NADRA, Revenue Office, Person/Company name',
      },
    ],
  },
  {
    title: 'DOCUMENT UPLOAD (Optional)',
    fields: [
      {
        id: 'documents',
        label: 'Upload Supporting Documents',
        type: 'file',
        required: false,
        hint: 'Property documents, POA, CNIC, passport, or any relevant files',
      },
    ],
  },
  {
    title: 'REGISTRATION FEE & PAYMENT',
    fields: [
      {
        id: 'feeInfo',
        label: 'Service Registration & Initial Legal Review Fee',
        type: 'radio',
        required: true,
        options: ['PKR 10,000', 'USD 100 (International Payment)', 'GBP 75', 'EUR 90'],
        hint: 'This fee includes: ✔ Initial legal review ✔ Case feasibility assessment ✔ Consultation scheduling ✔ File opening & allocation of dedicated legal counsel',
      },
    ],
  },
  {
    title: 'DECLARATION & CONSENT',
    fields: [
      {
        id: 'consentAccurate',
        label: 'I confirm that the information provided is accurate to the best of my knowledge.',
        type: 'checkbox',
        required: true,
      },
      {
        id: 'consentNonRefundable',
        label: 'I understand that the registration fee is non-refundable and does not constitute full legal fees for my matter.',
        type: 'checkbox',
        required: true,
      },
      {
        id: 'consentTerms',
        label: 'I agree to the Terms & Conditions and Privacy Policy of the firm.',
        type: 'checkbox',
        required: true,
      },
    ],
  },
];

export const paymentMethods = [
  'Credit / Debit Card',
  'Bank Transfer (Pakistan)',
  'International Wire Transfer (SWIFT)',
  'PayPal / Wise / Remitly',
];

export const overseasTrustPoints = [
  'Confidential handling',
  'Dedicated overseas desk',
  'Clear fee structure',
  'Regular case updates',
  'WhatsApp communication',
  'Time zone flexibility',
];

export const submissionResponse = {
  title: 'Thank you for registering your legal matter.',
  message: 'Our dedicated overseas desk will review your case and contact you within 24–48 working hours via your preferred contact method.',
  caseIdFormat: 'OPS-2026-XXX',
  additionalNote: 'You will receive a confirmation email with your Case ID and next steps.',
};

export const stepWiseFlow = [
  {
    step: 1,
    title: 'Client fills case details',
    description: 'Complete service selection and case information form',
  },
  {
    step: 2,
    title: 'Registration fee shown',
    description: 'Select payment currency and method, complete payment',
  },
  {
    step: 3,
    title: 'Submit case',
    description: 'Receive confirmation message with unique Case ID',
  },
  {
    step: 4,
    title: 'Team review',
    description: 'Dedicated overseas desk reviews within 24-48 hours',
  },
];
