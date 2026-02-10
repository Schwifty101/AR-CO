export interface FacilitationFAQ {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  duration: string;
}

export interface FacilitationService {
  id: string;
  title: string;
  tagline: string;
  whatWeDo: string[];
  processSteps: ProcessStep[];
  whyYouNeedIt: string;
  whyChooseUs: string;
  faqs: FacilitationFAQ[];
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

export const facilitationServices: FacilitationService[] = [
  {
    id: 'secp-registration',
    title: 'SECP Registration',
    tagline: 'From Idea to Legal Business',
    whatWeDo: [
      'Register companies, SMCs, LLPs, and partnerships',
      'Handle name reservation with SECP',
      'Complete incorporation process',
      'Provide post-registration guidance',
    ],
    processSteps: [
      {
        title: 'Name Reservation',
        description: 'Check company name availability on SECP eServices portal and reserve approved name',
        duration: '1-2 days',
      },
      {
        title: 'Document Preparation',
        description: 'Draft MOA, AOA, prepare SECP forms (Form 1, 21, 29), collect director/shareholder documents',
        duration: '2-3 days',
      },
      {
        title: 'SECP Submission',
        description: 'Submit incorporation application through SECP portal with required government fees',
        duration: '1-2 days',
      },
      {
        title: 'Certificate Issuance',
        description: 'SECP reviews application and issues Certificate of Incorporation',
        duration: '2-4 days',
      },
      {
        title: 'Post-Registration',
        description: 'Download company documents, obtain digital certificates, and provide compliance guidance',
        duration: '1 day',
      },
    ],
    whyYouNeedIt: 'Legal registration is mandatory to operate, invoice, and open business bank accounts.',
    whyChooseUs: 'Fast processing, correct structuring, and complete post-registration guidance.',
    faqs: [
      {
        question: 'How long does SECP registration take?',
        answer: 'Usually 3–7 working days, depending on name approval and documentation.',
      },
      {
        question: 'Can I register a company without an office?',
        answer: 'Yes, a residential address can be used initially.',
      },
    ],
  },
  {
    id: 'ip-registration',
    title: 'Intellectual Property (IP) Registration',
    tagline: 'Protect Your Brand Identity',
    whatWeDo: [
      'Register trademarks with IPO-Pakistan',
      'File copyright registrations',
      'Handle IP application follow-ups',
      'Provide protection-focused filing',
    ],
    processSteps: [
      {
        title: 'IP Search & Classification',
        description: 'Conduct trademark search on IPO-Pakistan database, determine correct Nice Classification',
        duration: '1-2 days',
      },
      {
        title: 'Application Preparation',
        description: 'Prepare trademark application (TM-1 Form), logo specifications, and required declarations',
        duration: '2-3 days',
      },
      {
        title: 'IPO Filing',
        description: 'Submit application to Intellectual Property Organization of Pakistan with filing fees',
        duration: '1 day',
      },
      {
        title: 'Examination & Publication',
        description: 'IPO examines application, publishes in Trademark Journal for opposition period (2 months)',
        duration: '3-6 months',
      },
      {
        title: 'Registration Certificate',
        description: 'If no opposition, IPO issues trademark registration certificate valid for 10 years',
        duration: '1-2 months',
      },
    ],
    whyYouNeedIt: 'Prevents misuse, copying, and brand disputes.',
    whyChooseUs: 'Proper classification, follow-ups, and protection-focused filing.',
    faqs: [
      {
        question: 'What can be registered as a trademark?',
        answer: 'Business name, logo, slogan, or brand identity.',
      },
      {
        question: 'Is trademark registration mandatory?',
        answer: 'Not mandatory, but strongly recommended to protect your brand.',
      },
    ],
  },
  {
    id: 'pfa-license',
    title: 'Pakistan Food Authority License',
    tagline: 'Food Business, Fully Legal',
    whatWeDo: [
      'Process licensing for restaurants and caterers',
      'Handle food manufacturer registrations',
      'Prepare for PFA inspections',
      'Ensure food safety compliance',
    ],
    processSteps: [
      {
        title: 'Business Assessment',
        description: 'Review food business type, premises, and determine PFA license category (A, B, or C)',
        duration: '1 day',
      },
      {
        title: 'Documentation',
        description: 'Prepare PFA application form, site plan, CNIC, business registration, lab test reports',
        duration: '3-5 days',
      },
      {
        title: 'PFA Submission',
        description: 'Submit application to Punjab Food Authority or relevant provincial food authority with fees',
        duration: '1-2 days',
      },
      {
        title: 'Inspection',
        description: 'PFA conducts premises inspection for hygiene, equipment, and food safety standards',
        duration: '1-2 weeks',
      },
      {
        title: 'License Issuance',
        description: 'Upon compliance verification, PFA issues food business license valid for one year',
        duration: '1-2 weeks',
      },
    ],
    whyYouNeedIt: 'Mandatory for food operations and inspections.',
    whyChooseUs: 'Smooth handling of documentation, inspection readiness, and compliance.',
    faqs: [
      {
        question: 'Is a food license required for home-based businesses?',
        answer: 'Yes, even home kitchens require registration.',
      },
      {
        question: 'Do inspections happen?',
        answer: 'Yes, food authority inspections are part of the process.',
      },
    ],
  },
  {
    id: 'import-export-license',
    title: 'Import / Export License',
    tagline: 'Trade Without Barriers',
    whatWeDo: [
      'Register for import/export business',
      'Obtain NTN and STRN registrations',
      'Handle customs compliance',
      'Provide trade facilitation guidance',
    ],
    processSteps: [
      {
        title: 'Business Registration',
        description: 'Ensure business is registered (SECP/partnership/sole proprietor) with valid NTN',
        duration: '1 day',
      },
      {
        title: 'Sales Tax Registration',
        description: 'Apply for STRN with FBR - mandatory for import/export operations',
        duration: '3-5 days',
      },
      {
        title: 'Chamber Enrollment',
        description: 'Register with relevant Chamber of Commerce and Industry (mandatory for importers)',
        duration: '3-7 days',
      },
      {
        title: 'Customs Registration',
        description: 'Register with Pakistan Customs (WeBOC portal) for electronic processing',
        duration: '2-3 days',
      },
      {
        title: 'License Activation',
        description: 'Complete all registrations, obtain import/export code, ready for trade operations',
        duration: '1-2 days',
      },
    ],
    whyYouNeedIt: 'Required for customs clearance and international trade.',
    whyChooseUs: 'End-to-end guidance with regulatory compliance.',
    faqs: [
      {
        question: 'Who needs an import/export license?',
        answer: 'Anyone involved in commercial import or export of goods.',
      },
      {
        question: 'Can individuals apply or only companies?',
        answer: 'Both individuals and registered businesses can apply.',
      },
    ],
  },
  {
    id: 'ihra-registration',
    title: 'IHRA Registration',
    tagline: 'Healthcare with Approval',
    whatWeDo: [
      'Register hospitals and clinics with IHRA',
      'Handle medical center licensing',
      'Prepare for IHRA inspections',
      'Ensure healthcare compliance',
    ],
    processSteps: [
      {
        title: 'Facility Assessment',
        description: 'Review healthcare facility type, services offered, and IHRA category requirements',
        duration: '1-2 days',
      },
      {
        title: 'Documentation',
        description: 'Compile IHRA application, facility plan, medical staff credentials, equipment list, SOPs',
        duration: '3-5 days',
      },
      {
        title: 'IHRA Submission',
        description: 'Submit application to Islamabad Healthcare Regulatory Authority with registration fees',
        duration: '1-2 days',
      },
      {
        title: 'Inspection & Review',
        description: 'IHRA conducts facility inspection for compliance with healthcare standards',
        duration: '2-4 weeks',
      },
      {
        title: 'Registration Certificate',
        description: 'IHRA issues healthcare facility registration certificate (annual renewal required)',
        duration: '1-2 weeks',
      },
    ],
    whyYouNeedIt: 'Mandatory to operate healthcare facilities in Islamabad.',
    whyChooseUs: 'Inspection-ready documentation and compliance support.',
    faqs: [
      {
        question: 'Is IHRA registration compulsory in Islamabad?',
        answer: 'Yes, all healthcare facilities in Islamabad must be registered.',
      },
      {
        question: 'Is renewal required?',
        answer: 'Yes, IHRA registration requires periodic renewal.',
      },
    ],
  },
  {
    id: 'drap-licensing',
    title: 'DRAP Licensing',
    tagline: 'Compliance for Medical Businesses',
    whatWeDo: [
      'License pharmacies with DRAP',
      'Register medical device businesses',
      'Handle drug sales licensing',
      'Ensure DRAP inspection readiness',
    ],
    processSteps: [
      {
        title: 'Business Classification',
        description: 'Determine DRAP license type - pharmacy, wholesale, medical devices, or healthcare products',
        duration: '1 day',
      },
      {
        title: 'Documentation',
        description: 'Prepare DRAP application, pharmacist credentials, premises documents, equipment details',
        duration: '3-5 days',
      },
      {
        title: 'DRAP Submission',
        description: 'Submit application to Drug Regulatory Authority of Pakistan with required fees',
        duration: '1-2 days',
      },
      {
        title: 'Inspection',
        description: 'DRAP conducts premises inspection for storage, handling, and safety compliance',
        duration: '2-4 weeks',
      },
      {
        title: 'License Issuance',
        description: 'DRAP issues operating license upon compliance verification (annual renewal)',
        duration: '1-2 weeks',
      },
    ],
    whyYouNeedIt: 'Legal requirement for healthcare-related operations.',
    whyChooseUs: 'Strong understanding of DRAP regulations and inspections.',
    faqs: [
      {
        question: 'Who needs DRAP approval?',
        answer: 'Pharmacies, medical device suppliers, and healthcare businesses.',
      },
      {
        question: 'Does DRAP conduct inspections?',
        answer: 'Yes, inspection readiness is mandatory.',
      },
    ],
  },
  {
    id: 'ntn-registration',
    title: 'NTN Registration',
    tagline: 'Your Tax Identity',
    whatWeDo: [
      'Register individuals with FBR',
      'Process business NTN applications',
      'Handle freelancer tax registration',
      'Ensure correct tax classification',
    ],
    processSteps: [
      {
        title: 'Profile Creation',
        description: 'Create account on FBR IRIS portal and determine taxpayer category',
        duration: '1 day',
      },
      {
        title: 'Document Collection',
        description: 'Gather CNIC, business documents (if applicable), bank account details',
        duration: '1-2 days',
      },
      {
        title: 'Online Application',
        description: 'Submit NTN application through FBR IRIS with required information',
        duration: '1 day',
      },
      {
        title: 'FBR Processing',
        description: 'FBR verifies information and processes NTN registration',
        duration: '1-3 days',
      },
      {
        title: 'NTN Certificate',
        description: 'Download NTN certificate from IRIS portal - immediately active',
        duration: '1 day',
      },
    ],
    whyYouNeedIt: 'Required for banking, invoicing, and tax compliance.',
    whyChooseUs: 'Correct classification to avoid future tax issues.',
    faqs: [
      {
        question: 'Can salaried persons apply for NTN?',
        answer: 'Yes, salaried individuals also require NTN.',
      },
      {
        question: 'Is NTN different from tax filing?',
        answer: 'Yes, NTN is registration; filing is done annually.',
      },
    ],
  },
  {
    id: 'strn-registration',
    title: 'Sales Tax Registration (STRN)',
    tagline: 'Operate & Invoice Legally',
    whatWeDo: [
      'Register for federal sales tax',
      'Handle provincial sales tax on services',
      'Process manufacturer registrations',
      'Provide compliance guidance',
    ],
    processSteps: [
      {
        title: 'Eligibility Check',
        description: 'Determine if business meets sales tax threshold and registration requirements',
        duration: '1 day',
      },
      {
        title: 'Documentation',
        description: 'Prepare NTN, business registration, CNIC, bank account details, premises documents',
        duration: '2-3 days',
      },
      {
        title: 'STRN Application',
        description: 'Apply through FBR IRIS portal (federal) or provincial revenue authority portal',
        duration: '1-2 days',
      },
      {
        title: 'Verification',
        description: 'Tax authority may conduct premises verification before approval',
        duration: '1-2 weeks',
      },
      {
        title: 'STRN Certificate',
        description: 'Receive Sales Tax Registration Number certificate - monthly returns required',
        duration: '3-5 days',
      },
    ],
    whyYouNeedIt: 'Mandatory for manufacturers, traders, and service providers.',
    whyChooseUs: 'Complete registration with compliance guidance.',
    faqs: [
      {
        question: 'Who must register for sales tax?',
        answer: 'Manufacturers, traders, and certain service providers.',
      },
      {
        question: 'Is sales tax registration nationwide?',
        answer: 'It depends on federal or provincial jurisdiction.',
      },
    ],
  },
  {
    id: 'tax-filing',
    title: 'Tax Filing Services',
    tagline: 'Stay Compliant, Stay Relaxed',
    whatWeDo: [
      'File individual income tax returns',
      'Handle business tax filing',
      'Process company tax returns',
      'Provide tax-saving guidance',
    ],
    processSteps: [
      {
        title: 'Information Gathering',
        description: 'Collect income statements, expense records, tax receipts, and previous returns',
        duration: '2-3 days',
      },
      {
        title: 'Tax Computation',
        description: 'Calculate taxable income, applicable deductions, and final tax liability',
        duration: '2-3 days',
      },
      {
        title: 'Return Preparation',
        description: 'Prepare tax return forms as per FBR requirements on IRIS portal',
        duration: '1-2 days',
      },
      {
        title: 'Review & Filing',
        description: 'Review with client, submit through FBR IRIS before deadline (September 30 for individuals)',
        duration: '1 day',
      },
      {
        title: 'Acknowledgment',
        description: 'Receive acknowledgment receipt, update filer status, advise on refund/payment',
        duration: '1 day',
      },
    ],
    whyYouNeedIt: 'Avoid penalties and maintain active filer status.',
    whyChooseUs: 'Accurate filing with tax-saving insight.',
    faqs: [
      {
        question: 'Is tax filing required every year?',
        answer: 'Yes, annual filing is mandatory.',
      },
      {
        question: 'What happens if I dont file taxes?',
        answer: 'You may face penalties and inactive filer status.',
      },
    ],
  },
  {
    id: 'property-transfer',
    title: 'Property Transfer',
    tagline: 'Ownership Made Official',
    whatWeDo: [
      'Complete property transfer documentation',
      'Handle mutation proceedings',
      'Process sale deed registration',
      'Ensure ownership verification',
    ],
    processSteps: [
      {
        title: 'Title Verification',
        description: 'Verify property ownership, check for encumbrances, liens, or legal disputes',
        duration: '2-3 days',
      },
      {
        title: 'Sale Deed Preparation',
        description: 'Draft sale deed, purchase agreement, prepare stamp papers as per DC rates',
        duration: '2-3 days',
      },
      {
        title: 'Registration',
        description: 'Register sale deed with Sub-Registrar office, pay stamp duty and registration fees',
        duration: '1-2 days',
      },
      {
        title: 'Mutation',
        description: 'Apply for mutation in revenue records (Patwari/Tehsildar) to update ownership',
        duration: '2-4 weeks',
      },
      {
        title: 'Transfer Completion',
        description: 'Collect registered deed and mutation certificate, verify updated revenue records',
        duration: '1 week',
      },
    ],
    whyYouNeedIt: 'Required to establish lawful ownership.',
    whyChooseUs: 'Secure documentation and transparent handling.',
    faqs: [
      {
        question: 'How long does property transfer take?',
        answer: 'Usually 1–2 weeks, depending on authority.',
      },
      {
        question: 'Can overseas owners transfer property?',
        answer: 'Yes, through proper authorization.',
      },
    ],
  },
  {
    id: 'agreement-drafting',
    title: 'Agreement Drafting',
    tagline: 'Contracts That Protect You',
    whatWeDo: [
      'Draft business agreements',
      'Prepare NDAs and MOUs',
      'Create employment contracts',
      'Customize legal contracts',
    ],
    processSteps: [
      {
        title: 'Requirement Analysis',
        description: 'Understand agreement purpose, parties involved, terms, and specific requirements',
        duration: '1-2 days',
      },
      {
        title: 'Drafting',
        description: 'Prepare legally sound agreement with relevant clauses, terms, conditions, and protections',
        duration: '2-4 days',
      },
      {
        title: 'Review & Revision',
        description: 'Share draft with client, incorporate feedback and revisions',
        duration: '1-2 days',
      },
      {
        title: 'Finalization',
        description: 'Prepare final agreement on stamp paper (if required), ready for execution',
        duration: '1 day',
      },
      {
        title: 'Execution Guidance',
        description: 'Advise on proper signing, witnessing, and notarization if needed',
        duration: '1 day',
      },
    ],
    whyYouNeedIt: 'Prevents disputes and protects interests.',
    whyChooseUs: 'Customized, legally sound drafting.',
    faqs: [
      {
        question: 'Can agreements be customized?',
        answer: 'Yes, all agreements are tailored to requirements.',
      },
      {
        question: 'Are drafted agreements legally valid?',
        answer: 'Yes, when properly executed and stamped.',
      },
    ],
  },
  {
    id: 'tv-channel-registration',
    title: 'TV Channel Registration',
    tagline: 'Broadcast with Compliance',
    whatWeDo: [
      'Register TV channels with PEMRA',
      'Handle satellite channel licensing',
      'Process cable channel permissions',
      'Ensure broadcast compliance',
    ],
    processSteps: [
      {
        title: 'Channel Assessment',
        description: 'Determine channel type - satellite, cable, terrestrial, and content category',
        duration: '1-2 days',
      },
      {
        title: 'Documentation',
        description: 'Prepare PEMRA application, business plan, content policy, financial statements, NOCs',
        duration: '1-2 weeks',
      },
      {
        title: 'PEMRA Submission',
        description: 'Submit application to Pakistan Electronic Media Regulatory Authority with fees',
        duration: '1-2 days',
      },
      {
        title: 'Authority Review',
        description: 'PEMRA reviews application, may conduct hearings or request additional information',
        duration: '3-6 months',
      },
      {
        title: 'License Issuance',
        description: 'PEMRA issues broadcast license (typically 15-year validity) with compliance conditions',
        duration: '2-4 weeks',
      },
    ],
    whyYouNeedIt: 'Mandatory regulatory approval to operate media platforms.',
    whyChooseUs: 'Complete regulatory coordination.',
    faqs: [
      {
        question: 'Is licensing mandatory for TV channels?',
        answer: 'Yes, regulatory approval is compulsory.',
      },
      {
        question: 'How long does approval take?',
        answer: 'Timelines vary depending on authority review.',
      },
    ],
  },
  {
    id: 'restaurant-license',
    title: 'Restaurant License & Registration',
    tagline: 'From Kitchen to Customers',
    whatWeDo: [
      'Complete restaurant legal setup',
      'Obtain food authority licenses',
      'Handle fire safety approvals',
      'Process trade licenses',
    ],
    processSteps: [
      {
        title: 'Business Setup',
        description: 'Register business entity, obtain NTN, and secure commercial premises',
        duration: '3-5 days',
      },
      {
        title: 'Food License',
        description: 'Apply for PFA or relevant provincial food authority license',
        duration: '2-3 weeks',
      },
      {
        title: 'Fire Safety NOC',
        description: 'Obtain fire safety certificate from Rescue/Fire Department',
        duration: '1-2 weeks',
      },
      {
        title: 'Trade License',
        description: 'Apply for trade license from municipal authority (Metropolitan Corporation/TMA)',
        duration: '1-2 weeks',
      },
      {
        title: 'Operational Clearance',
        description: 'Complete all registrations, ready for lawful restaurant operations',
        duration: '1 week',
      },
    ],
    whyYouNeedIt: 'Ensures lawful operation and food safety compliance.',
    whyChooseUs: 'One-window approval solution.',
    faqs: [
      {
        question: 'Can I open a restaurant without licenses?',
        answer: 'No, legal approvals are mandatory before operation.',
      },
      {
        question: 'Do small cafés also need registration?',
        answer: 'Yes, size does not exempt licensing.',
      },
    ],
  },
  {
    id: 'chamber-registration',
    title: 'Chamber of Commerce Registration',
    tagline: 'Official Business Recognition',
    whatWeDo: [
      'Register with local chambers',
      'Handle trade association enrollment',
      'Process membership applications',
      'Provide trade facilitation guidance',
    ],
    processSteps: [
      {
        title: 'Chamber Selection',
        description: 'Determine relevant chamber - FPCCI, Local Chamber, or Trade Association based on business type',
        duration: '1 day',
      },
      {
        title: 'Documentation',
        description: 'Compile business registration, NTN, CNIC, business profile, and membership application',
        duration: '2-3 days',
      },
      {
        title: 'Application Submission',
        description: 'Submit membership application to chamber with enrollment fee',
        duration: '1 day',
      },
      {
        title: 'Verification',
        description: 'Chamber verifies business credentials and reviews application',
        duration: '1-2 weeks',
      },
      {
        title: 'Membership Certificate',
        description: 'Receive chamber membership certificate (annual renewal required)',
        duration: '3-5 days',
      },
    ],
    whyYouNeedIt: 'Required for trade facilitation and credibility.',
    whyChooseUs: 'Quick processing with correct documentation.',
    faqs: [
      {
        question: 'Is chamber registration compulsory?',
        answer: 'Not mandatory, but highly beneficial for trade.',
      },
      {
        question: 'Can startups apply?',
        answer: 'Yes, startups and SMEs are eligible.',
      },
    ],
  },
  {
    id: 'succession-certificate',
    title: 'Succession Certificate',
    tagline: 'Access What Is Rightfully Yours',
    whatWeDo: [
      'File succession certificate petitions',
      'Handle court proceedings',
      'Represent legal heirs',
      'Expedite certificate issuance',
    ],
    processSteps: [
      {
        title: 'Legal Heir Verification',
        description: 'Identify legal heirs, gather death certificate, relationship proofs, asset details',
        duration: '2-3 days',
      },
      {
        title: 'Petition Drafting',
        description: 'Prepare succession certificate petition under Succession Act, 1925',
        duration: '3-5 days',
      },
      {
        title: 'Court Filing',
        description: 'File petition in relevant District Court with court fees',
        duration: '1-2 days',
      },
      {
        title: 'Notices & Hearings',
        description: 'Court issues public notices, conducts hearings, verifies legal heirs',
        duration: '3-6 months',
      },
      {
        title: 'Certificate Issuance',
        description: 'Court grants succession certificate authorizing heirs to claim assets',
        duration: '2-4 weeks',
      },
    ],
    whyYouNeedIt: 'Required to claim inherited assets.',
    whyChooseUs: 'Complete handling with court follow-ups.',
    faqs: [
      {
        question: 'Who can apply for a succession certificate?',
        answer: 'Legal heirs of the deceased.',
      },
      {
        question: 'Is court involvement required?',
        answer: 'Yes, it is issued through legal proceedings.',
      },
    ],
  },
  {
    id: 'family-registration',
    title: 'Family Registration Certificate (FRC)',
    tagline: 'Proof of Family, Simplified',
    whatWeDo: [
      'Process NADRA FRC applications',
      'Handle family tree registration',
      'Update family member records',
      'Expedite FRC issuance',
    ],
    processSteps: [
      {
        title: 'Document Collection',
        description: 'Gather CNICs of family head and all members, marriage certificate (Nikahnama), children\'s B-Forms',
        duration: '1-2 days',
      },
      {
        title: 'Application Preparation',
        description: 'Fill NADRA FRC application form with all family member details',
        duration: '1 day',
      },
      {
        title: 'NADRA Submission',
        description: 'Submit application at NADRA Registration Center with biometric verification',
        duration: '1 day',
      },
      {
        title: 'Verification',
        description: 'NADRA verifies family relationships and data in system',
        duration: '3-7 days',
      },
      {
        title: 'FRC Issuance',
        description: 'Collect Family Registration Certificate from NADRA center',
        duration: '1-2 days',
      },
    ],
    whyYouNeedIt: 'Required for visas, immigration, and official use.',
    whyChooseUs: 'Accurate and hassle-free processing.',
    faqs: [
      {
        question: 'Who can apply for FRC?',
        answer: 'Pakistani citizens with NADRA records.',
      },
      {
        question: 'How long does it take?',
        answer: 'Usually a few working days.',
      },
    ],
  },
  {
    id: 'child-registration',
    title: 'Child Registration Certificate (B-Form)',
    tagline: 'Identity from Day One',
    whatWeDo: [
      'Register children with NADRA',
      'Process B-Form applications',
      'Handle late registration cases',
      'Update child records',
    ],
    processSteps: [
      {
        title: 'Document Collection',
        description: 'Gather parents\' CNICs, child\'s birth certificate, immunization card',
        duration: '1 day',
      },
      {
        title: 'Application Form',
        description: 'Complete NADRA child registration form (B-Form application)',
        duration: '1 day',
      },
      {
        title: 'NADRA Submission',
        description: 'Submit application at NADRA center with child\'s photographs and documents',
        duration: '1 day',
      },
      {
        title: 'Processing',
        description: 'NADRA processes application and verifies parent-child relationship',
        duration: '3-7 days',
      },
      {
        title: 'B-Form Issuance',
        description: 'Collect child registration certificate (B-Form) from NADRA',
        duration: '1-2 days',
      },
    ],
    whyYouNeedIt: 'Essential for passport, school, and records.',
    whyChooseUs: 'Smooth process with complete guidance.',
    faqs: [
      {
        question: 'When should a child be registered?',
        answer: 'As soon as possible after birth.',
      },
      {
        question: 'Is B-Form required for passport?',
        answer: 'Yes, it is mandatory.',
      },
    ],
  },
];

export const commonDocuments = [
  {
    id: 'cnic',
    name: 'CNIC Copy',
    description: 'Clear copy of Computerized National Identity Card (both sides)',
    required: true,
  },
  {
    id: 'passport',
    name: 'Passport Copy (if applicable)',
    description: 'For overseas clients or international matters',
    required: false,
  },
  {
    id: 'business-documents',
    name: 'Business Registration Documents',
    description: 'Company incorporation certificate, partnership deed, or business registration',
    required: false,
  },
  {
    id: 'authorization',
    name: 'Power of Attorney / Authorization Letter',
    description: 'If filing on behalf of someone else',
    required: false,
  },
  {
    id: 'supporting-docs',
    name: 'Supporting Documents',
    description: 'Any relevant documents related to your specific case',
    required: false,
  },
];

export const facilitationRegistrationForm: FormSection[] = [
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
          'SECP Registration',
          'IP Registration',
          'Pakistan Food Authority License',
          'Import / Export License',
          'IHRA Registration',
          'DRAP Licensing',
          'NTN Registration',
          'Sales Tax Registration (STRN)',
          'Tax Filing',
          'Property Transfer',
          'Agreement Drafting',
          'TV Channel Registration',
          'Restaurant License and Registration',
          'Chamber of Commerce Registration',
          'Succession Certificate',
          'Family Registration Certificate',
          'Child Registration Certificate',
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
        hint: 'e.g., +92 300 1234567',
      },
      {
        id: 'countryOfResidence',
        label: 'Country of Residence',
        type: 'select',
        required: true,
        options: ['Pakistan', 'United Kingdom', 'United States', 'Canada', 'UAE', 'Saudi Arabia', 'Other'],
        placeholder: 'Select your country',
      },
    ],
  },
  {
    title: 'CLIENT CASE DETAILS',
    fields: [
      {
        id: 'caseDescription',
        label: 'Brief Description of Your Matter',
        type: 'textarea',
        required: true,
        placeholder: 'Please provide key facts only',
        hint: 'Explain your requirement in simple terms',
      },
      {
        id: 'cityLocation',
        label: 'City / Location in Pakistan (if applicable)',
        type: 'text',
        required: false,
        placeholder: 'e.g., Islamabad, Lahore, Karachi',
      },
      {
        id: 'relevantAuthority',
        label: 'Against which Relevant Authority? (if any)',
        type: 'text',
        required: false,
        placeholder: 'e.g., SECP, FBR, NADRA, etc.',
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
        hint: 'CNIC, Business documents, Authorization letter, or any relevant documents',
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
        options: ['PKR 5,000', 'USD 50 (International Clients)'],
        hint: 'This fee includes: Initial legal review, Case feasibility assessment, Consultation scheduling, File opening & allocation of legal counsel',
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
  'Bank Transfer',
  'International Transfer (Wire/SWIFT)',
  'JazzCash / EasyPaisa',
];

export const trustPoints = [
  'Confidential handling',
  'Dedicated overseas desk',
  'Clear fee structure',
  'Regular case updates',
];

export const submissionResponse = {
  title: 'Thank you for registering your legal matter.',
  message: 'Our team will review your case and contact you within 24–48 working hours.',
  caseIdFormat: 'OPS-2026-XXX',
};
